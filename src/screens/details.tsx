import { useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'
import {
  IncomingTram,
  pidDataToStopData,
  tfgmCall,
  TfGMData,
} from '../clients/tfgmAPI'
import TramDetailsBox from '../components/tramDetailsBox'
import { config } from '../config'

const tfgmEndpoint = 'https://api.tfgm.com/odata/Metrolinks'

export default function DetailsScreen() {
  const [showDropDown, setShowDropDown] = useState(false)
  const [stop, setStop] = useState('')
  const [incomingTrams, setIncomingTrams] = useState<IncomingTram[]>([])
  const [stopsObtained, setStopsObtained] = useState<
    { label: string; value: string }[]
  >([])

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

  async function handleClick() {
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

  function filterJson(json: TfGMData): TfGMData {
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
      <Button
        style={{ marginTop: 15 }}
        mode="outlined"
        onPress={() => void handleClick()}
      >
        Find Times
      </Button>

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
