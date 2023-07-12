import { useState } from 'react'
import { FlatList, StyleSheet, View, Text } from 'react-native'
import { Button } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'
import { config } from '../config'

const tfgmEndpoint = 'https://api.tfgm.com/odata/Metrolinks'
const stops = [
  {
    label: 'Piccadilly Gardens',
    value: '9400ZZMAPGD',
  },
  {
    label: 'Firswood',
    value: '9400ZZMAFIR',
  },
  {
    label: 'Sale Water Park',
    value: '9400ZZMASWP',
  },
  {
    label: 'Parkway',
    value: '9400ZZMAPAR',
  },
  {
    label: 'Rochdale Railway Station',
    value: '9400ZZMARRS',
  },
]

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
  Dest: string
  Wait: string
  Carriages: string
  Status: string
}

class CollectedStopData {
  stopName = ''
  incomingTrams: IncomingTram[] = []
}

// type CollectedStopData = {}

export default function DetailsScreen() {
  const [showDropDown, setShowDropDown] = useState(false)
  const [stop, setStop] = useState('')
  const [incomingTrams, setIncomingTrams] = useState([] as IncomingTram[])

  async function handleClick() {
    console.log('Clicked')
    const res = await fetch(tfgmEndpoint, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    })
    console.log('Received')
    const json = (await res.json()) as { value: APIType }
    console.log('Converted')
    const stopsData = filterJson(json.value)
    console.log('Filtered: ' + stopsData.length.toString())
    const collectedStopData = collectStopData(stopsData)
    console.log(
      'Collected: ' + collectedStopData.incomingTrams.length.toString()
    )

    setIncomingTrams(collectedStopData.incomingTrams)
  }

  function collectStopData(stopsData: APIType): CollectedStopData {
    /*TODO*/
    const collectedStopData = new CollectedStopData()
    if (stopsData.length === 0) {
      return collectedStopData
    }

    collectedStopData.stopName = stopsData[0].StationLocation
    for (const platformData of stopsData) {
      collectedStopData.incomingTrams.push({
        Dest: platformData.Dest0,
        Wait: platformData.Wait0,
        Status: platformData.Status0,
        Carriages: platformData.Carriages0,
      })
      collectedStopData.incomingTrams.push({
        Dest: platformData.Dest1,
        Wait: platformData.Wait1,
        Status: platformData.Status1,
        Carriages: platformData.Carriages1,
      })
      collectedStopData.incomingTrams.push({
        Dest: platformData.Dest2,
        Wait: platformData.Wait2,
        Status: platformData.Status2,
        Carriages: platformData.Carriages2,
      })
    }

    collectedStopData.incomingTrams = collectedStopData.incomingTrams.filter(
      (a) => !(a.Wait === '')
    )

    collectedStopData.incomingTrams.sort((a, b) => {
      if (a.Status === 'Departing') {
        return -1
      }
      if (b.Status === 'Departing') {
        return 1
      }
      return 0
    })

    collectedStopData.incomingTrams.sort(
      (a, b) => parseInt(a.Wait) - parseInt(b.Wait)
    )

    return collectedStopData
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
        list={stops}
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
  if (tram.Status === 'Due') {
    waitText = 'Due in ' + tram.Wait + ' minutes'
  } else {
    waitText = tram.Status
  }
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{tram.Dest}</Text>
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
