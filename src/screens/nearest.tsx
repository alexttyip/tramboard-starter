import { DateTime } from 'luxon'
import { useState, useEffect, useCallback } from 'react'
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
import ErrorBox from '../components/errorBox'
import TramDetailsBox from '../components/tramDetailsBox'
import haversine from 'haversine-distance'

export type Coordinates = {
  latitude: number
  longitude: number
}

function calculateDistance(locationA: Coordinates, locationB: Coordinates) {
  // Euclidean for now
  return haversine(locationA, locationB)
}

export default function NearestStopScreen() {
  const [nearestStop, setNearestStop] = useState<BasicStopData>()
  const [incomingTrams, setIncomingTrams] = useState<IncomingTram[]>([])
  const [stopsObtained, setStopsObtained] = useState<BasicStopData[]>([])
  const [location, setLocation] = useState<Coordinates>()
  const [errorMsg, setErrorMsg] = useState<string>()
  const [showOptions, setShowOptions] = useState<boolean>(true)
  const [postcode, setPostcode] = useState<string>()
  const [postcodeErrorMsg, setPostcodeErrorMsg] = useState<string | undefined>()
  const [updateTime, setUpdateTime] = useState<string>()

  async function locUseCurrentLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied')
      return
    }
    const location = await Location.getCurrentPositionAsync({})
    setLocation(location.coords)
  }

  const filterJson = useCallback(
    (json: TfGMData): TfGMData => {
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
    },
    [nearestStop]
  )

  async function locUsePostcodeLocation() {
    if (postcode) {
      const postcodeLocation = await postcodeCall(postcode)
      if (typeof postcodeLocation === 'number') {
        setPostcodeErrorMsg(
          'This postcode could not be found. Please enter a valid postcode or try again later'
        )
        setShowOptions(true)
        return
      }
      const postcodeCoordinates = {
        latitude: postcodeLocation.latitude,
        longitude: postcodeLocation.longitude,
      }
      setLocation(postcodeCoordinates)
    } else {
      setPostcodeErrorMsg(
        'Postcode is undefined. Please enter a valid postcode'
      )
      setShowOptions(true)
    }
  }

  useEffect(() => {
    async function effectFunc() {
      const stops = await getAllStops()
      setStopsObtained(stops)
    }

    void effectFunc()
  }, [])

  const getNearestStop = useCallback(async () => {
    if (nearestStop) {
      return
    }
    if (!location) {
      return
    }
    if (stopsObtained.length === 0) {
      return
    }

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
  }, [location, stopsObtained, nearestStop])

  const showTrams = useCallback(async () => {
    if (!nearestStop) {
      return
    }

    const json = await tfgmCall()
    const screenData = filterJson(json.value)
    const stopData = pidDataToStopData(screenData)

    setIncomingTrams(stopData.incomingTrams)
    setUpdateTime(
      DateTime.now().setLocale('en-GB').toLocaleString(DateTime.DATETIME_FULL)
    )
  }, [nearestStop, filterJson])

  useEffect(
    () => void getNearestStop(),
    [location, stopsObtained, getNearestStop]
  )
  useEffect(() => void showTrams(), [nearestStop, showTrams])

  function filterDuplicates(data: DfTData[]): DfTData[] {
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
        <Text style={styles.title}>Find a stop nearby</Text>
        <TextInput
          label="Postcode"
          outlineColor={'black'}
          activeOutlineColor={'black'}
          value={postcode}
          mode={'outlined'}
          style={{ margin: 5 }}
          onChangeText={(postcode) => setPostcode(postcode)}
        ></TextInput>
        <ErrorBox msg={postcodeErrorMsg} />
        <Button
          style={styles.button}
          dark={false}
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
          dark={false}
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
        <Text style={styles.title}>Finding nearest stop...</Text>
        <ActivityIndicator animating={true} color={MD2Colors.red800} />
      </View>
    )
  }
  return (
    <View style={{ overflow: 'hidden' }}>
      <View style={styles.container}>
        <Text style={styles.title}>{nearestStop.stopName}</Text>
        <FlatList
          data={incomingTrams}
          renderItem={({ item }) => <TramDetailsBox tram={item} />}
        />
        <Text style={{ fontSize: 12, textAlign: 'center' }}>
          Last Updated at {updateTime}
        </Text>
        <Button
          style={styles.button}
          mode="contained"
          dark={false}
          onPress={() => void showTrams()}
        >
          Refresh Times
        </Button>
      </View>
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
    alignSelf: 'center',
    fontSize: 24,
    margin: 5,
  },
  titleStop: {
    fontSize: 24,
  },
  button: {
    marginVertical: 8,
    color: 'black',
    backgroundColor: '#ffec44',
    borderColor: '#000000',
    borderWidth: 1,
  },
})
