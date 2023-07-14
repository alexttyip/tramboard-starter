import { LocationObject } from 'expo-location'
import { useState, useEffect } from 'react'
import { FlatList, StyleSheet, View, Text } from 'react-native'
import {
  ActivityIndicator,
  Button,
  MD2Colors,
  TextInput,
} from 'react-native-paper'
import * as Location from 'expo-location'
import { dftCallToJSON, DfTData } from '../clients/dftAPI'
import { postcodeCall } from '../clients/postcodeAPI'
import {
  tfgmCall,
  TfGMData,
  IncomingTram,
  pidDataToStopData,
  getAllStops,
  BasicStopData,
} from '../clients/tfgmAPI'
import TramDetailsBox from '../components/tramDetailsBox'

export type Coordinates = {
  latitude: number
  longitude: number
}

function calculateDistance(locationA: Coordinates, locationB: Coordinates) {
  // Euclidean for now
  return Math.sqrt(
    Math.pow(locationA.latitude - locationB.latitude, 2) +
      Math.pow(locationA.longitude - locationB.longitude, 2)
  )
}

export default function NearestStopScreen() {
  const [nearestStop, setNearestStop] = useState<BasicStopData>()
  const [incomingTrams, setIncomingTrams] = useState<IncomingTram[]>([])
  const [stopsObtained, setStopsObtained] = useState<BasicStopData[]>([])
  const [location, setLocation] = useState<Coordinates>()
  const [errorMsg, setErrorMsg] = useState<string>()
  const [showOptions, setShowOptions] = useState<boolean>(true)
  const [postcode, setPostcode] = useState<string>()

  async function locUseCurrentLocation() {
    console.log('Entered locUseCurrentLocation')
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied')
      return
    }
    const location = await Location.getCurrentPositionAsync({})

    setLocation(location.coords)
  }

  async function locUsePostcodeLocation() {
    if (postcode) {
      const postcodeLocation = await postcodeCall(postcode)
      const postcodeCoordinates = {
        latitude: postcodeLocation.latitude,
        longitude: postcodeLocation.longitude,
      }
      setLocation(postcodeCoordinates)
    }
  }

  useEffect(() => {
    async function effectFunc() {
      const stops = await getAllStops()
      setStopsObtained(stops)
    }

    void effectFunc()
  }, [])
  useEffect(() => void getNearestStop(), [location, stopsObtained])
  useEffect(() => void showTrams(), [nearestStop])

  function filterDuplicates(data: DfTData[]): DfTData[] {
    console.log('Running filterDuplicates')
    return data.reduce<DfTData[]>((reducedData, stop) => {
      const truncAtcoCode = stop.atcoCode.substring(0, stop.atcoCode.length - 1)
      if (
        !reducedData.some((discoveredStop) => {
          return discoveredStop.atcoCode.includes(truncAtcoCode)
        })
      ) {
        reducedData.push(stop)
      }
      return reducedData
    }, [])
  }

  function filterJson(json: TfGMData): TfGMData {
    if (!nearestStop) {
      return []
    }
    const usedCodes: string[] = []
    return json.filter((apiStop) => {
      if (usedCodes.includes(apiStop.AtcoCode)) {
        return false
      }
      usedCodes.push(apiStop.AtcoCode)
      return apiStop.AtcoCode.includes(nearestStop.truncatedAtcoCode)
    })
  }

  async function getNearestStop() {
    if (nearestStop) {
      console.log('!nearestStop')
      return
    }
    if (!location) {
      console.log('!location')
      return
    }
    if (stopsObtained.length === 0) {
      console.log('stopsObtained =0 ')
      return
    }
    console.log('Running getNearestStop')

    let stopDataDfT = await dftCallToJSON()
    stopDataDfT = filterDuplicates(stopDataDfT)

    stopDataDfT.sort((stopA, stopB) => {
      const stopALocation: Coordinates = {
        latitude: parseFloat(stopA.latitude),
        longitude: parseFloat(stopA.longitude),
      }
      const stopBLocation: Coordinates = {
        latitude: parseFloat(stopB.latitude),
        longitude: parseFloat(stopB.longitude),
      }
      return (
        calculateDistance(stopALocation, location) -
        calculateDistance(stopBLocation, location)
      )
    })

    const platformAtcoCode =
      '94' +
      stopDataDfT[0].atcoCode.substring(2, stopDataDfT[0].atcoCode.length - 1)

    const stopsOrderedByDistance = stopsObtained.filter((stop) => {
      return platformAtcoCode.includes(stop.truncatedAtcoCode)
    })

    setNearestStop(stopsOrderedByDistance[0])
  }

  async function showTrams() {
    if (!nearestStop) {
      return
    }
    if (incomingTrams.length > 0) {
      return
    }
    console.log('Running showTrams')
    const json = await tfgmCall()
    const screenData = filterJson(json.value)
    const stopData = pidDataToStopData(screenData)

    setIncomingTrams(stopData.incomingTrams)
  }

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg}</Text>
      </View>
    )
  }
  if (showOptions) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Find nearest stop by location.</Text>
        <TextInput
          label="Postcode"
          value={postcode}
          onChangeText={(postcode) => setPostcode(postcode)}
        ></TextInput>
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => {
            setShowOptions(false)
            void locUsePostcodeLocation()
          }}
        >
          Use Postcode
        </Button>
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => {
            setShowOptions(false)
            void locUseCurrentLocation()
          }}
        >
          Use Current Location
        </Button>
      </View>
    )
  }
  if (incomingTrams.length === 0 || !nearestStop) {
    return (
      <View style={styles.container}>
        <Text>Finding nearest stop...</Text>
        <ActivityIndicator animating={true} color={MD2Colors.red800} />
      </View>
    )
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{nearestStop.stopName}</Text>
      <FlatList
        data={incomingTrams}
        renderItem={({ item }) => <TramDetailsBox tram={item} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 300,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
  },
  button: {
    marginTop: 15,
  },
})
