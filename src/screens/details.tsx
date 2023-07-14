import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'
import {
  BasicStopData,
  getAllStops,
  IncomingTram,
  pidDataToStopData,
  tfgmCall,
  TfGMData,
} from '../clients/tfgmAPI'
import TramDetailsBox from '../components/tramDetailsBox'

export default function DetailsScreen() {
  const [showDropDown, setShowDropDown] = useState(false)
  const [stop, setStop] = useState('')
  const [incomingTrams, setIncomingTrams] = useState<IncomingTram[]>([])
  const [stopsObtained, setStopsObtained] = useState<BasicStopData[]>([])

  async function handleClick() {
    const json = await tfgmCall()
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

  useEffect(() => {
    async function effectFunc() {
      const stops = await getAllStops()
      setStopsObtained(stops)
    }

    void effectFunc()
  }, [])

  return (
    <View style={styles.container}>
      <DropDown
        label={'Select Stop...'}
        mode={'outlined'}
        visible={showDropDown}
        showDropDown={() => setShowDropDown(true)}
        onDismiss={() => setShowDropDown(false)}
        value={stop}
        setValue={setStop}
        list={basicStopDataArrayToDropdownList(stopsObtained)}
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

function basicStopDataArrayToDropdownList(basicStopDataArray: BasicStopData[]) {
  return basicStopDataArray.map<{ label: string; value: string }>(
    (basicStopData) => {
      return {
        label: basicStopData.stopName,
        value: basicStopData.truncatedAtcoCode,
      }
    }
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
