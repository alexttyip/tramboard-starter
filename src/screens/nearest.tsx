import { LocationObject, LocationObjectCoords } from 'expo-location'
import { useState, useEffect } from 'react'
import { FlatList, StyleSheet, View, Text, Platform } from 'react-native'
import { ActivityIndicator, MD2Colors } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'
import * as Location from 'expo-location'
import { config } from '../config'

const tfgmEndpoint = 'https://api.tfgm.com/odata/Metrolinks'

type TfGMData = {
  AtcoCode: string
  StationLocation: string
  Dest0: string
  Wait0: string
  Status0: string
  Carriages0: string
  Dest1: string
  Wait1: string
  Status1: string
  Carriages1: string
  Dest2: string
  Wait2: string
  Status2: string
  Carriages2: string
}[]

type DfTData = {
  atcoCode: string
  longitude: string
  latitude: string
}

type IncomingTram = {
  dest: string
  wait: string
  carriages: string
  status: string
}

type Coordinates = {
  latitude: number
  longitude: number
}

class StopData {
  stopName = ''
  incomingTrams: IncomingTram[] = []
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
  const [closestStop, setClosestStop] = useState({ name: '', atcoCode: '' })
  const [incomingTrams, setIncomingTrams] = useState([] as IncomingTram[])
  const [stopsObtained, setStopsObtained] = useState(
    [] as { label: string; value: string }[]
  )
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
    }
    void effectFunc()
  }, [])

  async function getAllStops() {
    if (stopsObtained.length > 0) {
      return
    }
    console.log('Running getAllStops')

    const stops: { label: string; value: string }[] = []
    const res = await fetch(tfgmEndpoint, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    })
    const json = (await res.json()) as { value: TfGMData }
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

  async function getNearestStop() {
    if (closestStop.name !== '') {
      return
    }
    if (!location) {
      return
    }
    if (stopsObtained.length === 0) {
      return
    }
    console.log('Running getNearestStop')

    const res = await fetch(
      'https://beta-naptan.dft.gov.uk/Download/MultipleLa',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          selectedLasNames: 'Greater Manchester / North West (180)',
          fileTypeSelect: 'csv',
        }).toString(),
      }
    )
    const stopDataAsCsvDfT = await res.text()
    let stopDataDfT = csvToJson(stopDataAsCsvDfT)
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

    setClosestStop({ name: stopName[0].label, atcoCode: stopName[0].value })
  }

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

  function csvToJson(csvData: string): DfTData[] {
    console.log('Running csvToJson')
    const json: DfTData[] = []
    const lines = csvData.split('\n')

    const headers = lines[0].split(',')
    const longitudeIndex = headers.findIndex((s) => s === 'Longitude')
    const latitudeIndex = headers.findIndex((s) => s === 'Latitude')
    const atcoCodeIndex = headers.findIndex((s) => s === 'ATCOCode')

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (!values[atcoCodeIndex].includes('1800ZZ', 0)) {
        continue
      }

      json.push({
        longitude: values[longitudeIndex],
        latitude: values[latitudeIndex],
        atcoCode: values[atcoCodeIndex],
      })
    }
    return json
  }

  async function showTrams() {
    if (incomingTrams.length > 0) {
      return
    }
    console.log('Running showTrams')
    const res = await fetch(tfgmEndpoint, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    })
    const json = (await res.json()) as { value: TfGMData }
    const screenData = filterJson(json.value)
    const stopData = pidDataToStopData(screenData)

    setIncomingTrams(stopData.incomingTrams)
  }

  function pidDataToStopData(pidData: TfGMData): StopData {
    console.log('Running pidDataToStopData')
    const stopData = new StopData()
    if (pidData.length === 0) {
      return stopData
    }

    stopData.stopName = pidData[0].StationLocation
    for (const platformData of pidData) {
      stopData.incomingTrams.push({
        dest: platformData.Dest0,
        wait: platformData.Wait0,
        status: platformData.Status0,
        carriages: platformData.Carriages0,
      })
      stopData.incomingTrams.push({
        dest: platformData.Dest1,
        wait: platformData.Wait1,
        status: platformData.Status1,
        carriages: platformData.Carriages1,
      })
      stopData.incomingTrams.push({
        dest: platformData.Dest2,
        wait: platformData.Wait2,
        status: platformData.Status2,
        carriages: platformData.Carriages2,
      })
    }

    stopData.incomingTrams = stopData.incomingTrams.filter(
      (a) => !(a.wait === '')
    )

    stopData.incomingTrams.sort((a, b) => parseInt(a.wait) - parseInt(b.wait))

    stopData.incomingTrams.sort((a, b) => {
      if (a.status === 'Departing' && b.status === 'Arrived') {
        return -1
      }
      if (b.status === 'Departing' && a.status == 'Arrived') {
        return 1
      }
      return 0
    })

    return stopData
  }

  function filterJson(json: TfGMData): TfGMData {
    console.log('Running filterJson')
    const usedCodes: string[] = []
    return json.filter((apiStop) => {
      if (usedCodes.includes(apiStop.AtcoCode)) {
        return false
      }
      usedCodes.push(apiStop.AtcoCode)
      return apiStop.AtcoCode.includes(closestStop.atcoCode)
    })
  }

  void getNearestStop()
  void showTrams()
  void getAllStops()

  if (closestStop.name === '') {
    return (
      <View style={styles.container}>
        <Text>Finding nearest stop...</Text>
        <ActivityIndicator animating={true} color={MD2Colors.red800} />
      </View>
    )
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{closestStop.name}</Text>
      <FlatList
        data={incomingTrams}
        renderItem={({ item }) => <Tram tram={item} />}
      />
    </View>
  )
}

type TramProperty = {
  tram: IncomingTram
}

const Tram = ({ tram }: TramProperty) => {
  let waitText: string
  if (tram.status === 'Due') {
    waitText = 'Due in ' + tram.wait + ' minutes'
  } else {
    waitText = tram.status
  }
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{tram.dest}</Text>
      <Text>{waitText}</Text>
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
  item: {
    backgroundColor: '#ffec44',
    padding: 20,
    marginVertical: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
  },
})
