import { useState } from 'react'
import { FlatList, StyleSheet, View, Text } from 'react-native'
import { Button } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'
import { config } from '../config'

const tfgmEndpoint = 'https://api.tfgm.com/odata/Metrolinks'

type APIType = {
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

type IncomingTram = {
  dest: string
  wait: string
  carriages: string
  status: string
}

class StopData {
  stopName = ''
  incomingTrams: IncomingTram[] = []
}

export default function DetailsScreen() {
  const [showDropDown, setShowDropDown] = useState(false)
  const [stop, setStop] = useState('')
  const [incomingTrams, setIncomingTrams] = useState([] as IncomingTram[])
  const [stopsObtained, setStopsObtained] = useState(
    [] as { label: string; value: string }[]
  )

  async function getAllStops() {
    if (stopsObtained.length > 0) {
      return
    }

    const stops: { label: string; value: string }[] = []
    const res = await fetch(tfgmEndpoint, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    })
    const json = (await res.json()) as { value: APIType }
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

  async function handleClick() {
    const res = await fetch(tfgmEndpoint, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    })
    const json = (await res.json()) as { value: APIType }
    const screenData = filterJson(json.value)
    const stopData = screenDataToStopData(screenData)

    setIncomingTrams(stopData.incomingTrams)
  }

  function screenDataToStopData(screenData: APIType): StopData {
    const stopData = new StopData()
    if (screenData.length === 0) {
      return stopData
    }

    stopData.stopName = screenData[0].StationLocation
    for (const platformData of screenData) {
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

  function filterJson(json: APIType): APIType {
    const usedCodes: string[] = []
    return json.filter((apiStop) => {
      if (usedCodes.includes(apiStop.AtcoCode)) {
        return false
      }
      usedCodes.push(apiStop.AtcoCode)
      return apiStop.AtcoCode.includes(stop)
    })
  }

  void getAllStops()

  return (
    <View style={styles.container}>
      <DropDown
        label={'Stops'}
        mode={'outlined'}
        visible={showDropDown}
        showDropDown={() => setShowDropDown(true)}
        onDismiss={() => setShowDropDown(false)}
        value={stop}
        setValue={setStop}
        list={stopsObtained}
      />
      <View style={{ padding: '2%' }}></View>
      <Button mode="outlined" onPress={() => void handleClick()}>
        Find Times
      </Button>

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
