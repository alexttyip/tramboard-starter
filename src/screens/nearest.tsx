import { LocationObject } from 'expo-location'
import { useState, useEffect } from 'react'
import { FlatList, StyleSheet, View, Text, Platform } from 'react-native'
import { ActivityIndicator, MD2Colors } from 'react-native-paper'
import * as Location from 'expo-location'
import { dftCallToJSON, DfTData } from '../clients/dftAPI'
import {
  tfgmCall,
  TfGMData,
  IncomingTram,
  pidDataToStopData,
} from '../clients/tfgmAPI'
import TramDetailsBox from '../components/tramDetailsBox'
import { config } from '../config'

type Coordinates = {
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
  console.log('Rendering.....')
  const [nearestStop, setNearestStop] = useState<{
    name: string
    atcoCode: string
  }>()
  const [incomingTrams, setIncomingTrams] = useState<IncomingTram[]>([])
  const [stopsObtained, setStopsObtained] = useState<
    { label: string; value: string }[]
  >([])
  const [location, setLocation] = useState<LocationObject>()
  const [errorMsg, setErrorMsg] = useState<string>()

  useEffect(() => {
    const effectFunc = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation(location)
      console.log('Got Location')
    }
    void effectFunc()
  }, [])

  useEffect(() => void getAllStops(), [getAllStops])
  console.log('About to getNearestStop')
  useEffect(
    () => void getNearestStop(),
    [location, stopsObtained, getNearestStop]
  )
  console.log('About to showTrams')
  useEffect(() => void showTrams(), [nearestStop, showTrams])

  function filterDuplicates(data: DfTData[]): DfTData[] {
    console.log('Running filterDuplicates')
    const usedCodes: string[] = []
    return data.filter((stop) => {
      if (usedCodes.some((atcoCode) => stop.atcoCode.includes(atcoCode))) {
        return false
      }
      usedCodes.push(stop.atcoCode.substring(0, stop.atcoCode.length - 1))
      return true
    })
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
      return apiStop.AtcoCode.includes(nearestStop.atcoCode)
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
        calculateDistance(stopALocation, location.coords) -
        calculateDistance(stopBLocation, location.coords)
      )
    })

    const platformAtcoCode =
      '94' +
      stopDataDfT[0].atcoCode.substring(2, stopDataDfT[0].atcoCode.length - 1)

    const stopName = stopsObtained.filter((stop) => {
      return platformAtcoCode.includes(stop.value)
    })

    setNearestStop({ name: stopName[0].label, atcoCode: stopName[0].value })
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

  async function getAllStops() {
    if (stopsObtained.length > 0) {
      return
    }

    const stops: { label: string; value: string }[] = []
    const json = await tfgmCall()
    for (const item of json.value) {
      const truncAtcoCode = item.AtcoCode.substring(0, item.AtcoCode.length - 1)
      const newStop = { label: item.StationLocation, value: truncAtcoCode }

      if (
        !stops.some((value) => {
          return value.value === truncAtcoCode
        })
      ) {
        stops.push(newStop)
      }
    }

    setStopsObtained(stops)
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
      <Text style={styles.title}>{nearestStop.name}</Text>
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
})
