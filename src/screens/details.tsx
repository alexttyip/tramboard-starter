import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import {
  AutocompleteDropdownContextProvider,
  AutocompleteDropdown,
  TAutocompleteDropdownItem,
} from 'react-native-autocomplete-dropdown'
import { Button } from 'react-native-paper'
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
  const [stop, setStop] = useState<TAutocompleteDropdownItem | null>(null)
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
      if (stop) {
        return apiStop.AtcoCode.includes(stop.id)
      }
      return false
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
    <AutocompleteDropdownContextProvider>
      <View style={styles.container}>
        <AutocompleteDropdown
          clearOnFocus={false}
          closeOnBlur={true}
          textInputProps={{
            placeholder: 'Choose stop to show details',
          }}
          inputContainerStyle={{
            marginTop: 15,
          }}
          closeOnSubmit={false}
          onSelectItem={setStop}
          dataSet={basicStopDataArrayToDropdownList(stopsObtained)}
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
    </AutocompleteDropdownContextProvider>
  )
}

function basicStopDataArrayToDropdownList(basicStopDataArray: BasicStopData[]) {
  return basicStopDataArray
    .map<{ title: string; id: string }>((basicStopData) => {
      return {
        title: basicStopData.stopName,
        id: basicStopData.truncatedAtcoCode,
      }
    })
    .sort((a, b) => (a.title < b.title ? -1 : 1))
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
