import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import {
  AutocompleteDropdownContextProvider,
  AutocompleteDropdown,
  TAutocompleteDropdownItem,
} from 'react-native-autocomplete-dropdown'
import { Button, Text } from 'react-native-paper'
import {
  BasicStopData,
  getAllStops,
  IncomingTram,
  pidDataToStopData,
  tfgmCall,
  TfGMData,
} from '../clients/tfgmAPI'
import { DateTime } from 'luxon'
import TramDetailsBox from '../components/tramDetailsBox'

export default function DetailsScreen() {
  const [stop, setStop] = useState<TAutocompleteDropdownItem | null>(null)
  const [incomingTrams, setIncomingTrams] = useState<IncomingTram[]>([])
  const [stopsObtained, setStopsObtained] = useState<BasicStopData[]>([])
  const [updateTime, setUpdateTime] = useState<string>()

  async function handleClick() {
    const json = await tfgmCall()
    const screenData = filterJson(json.value)
    const stopData = pidDataToStopData(screenData)

    setIncomingTrams(stopData.incomingTrams)
    setUpdateTime(
      DateTime.now().setLocale('en-GB').toLocaleString(DateTime.DATETIME_FULL)
    )
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
            placeholderTextColor: '#000000',
          }}
          inputContainerStyle={{
            marginTop: 15,
            backgroundColor: '#ffffff',
            borderWidth: 1,
          }}
          closeOnSubmit={false}
          onSelectItem={setStop}
          dataSet={basicStopDataArrayToDropdownList(stopsObtained)}
        />
        <Button
          style={styles.button}
          mode="contained"
          dark={false}
          onPress={() => void handleClick()}
        >
          Find Times
        </Button>

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
          onPress={() => void handleClick()}
        >
          Refresh Times
        </Button>
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
  button: {
    marginVertical: 8,
    color: 'black',
    backgroundColor: '#ffec44',
    borderColor: '#000000',
    borderWidth: 1,
    overflow: 'hidden',
  },
})
