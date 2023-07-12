import React, { Dispatch, SetStateAction, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'

type StopsDropDownProps = {
  setResult: Dispatch<SetStateAction<string>>
  handleResults: (value: Object) => void
}
const listOfStops:{ label: string,  value: string }[] = []
function addStopToList(stopName: string) {
  listOfStops.push({ label: stopName, value:stopName});
}
function addListToStopList(stopNames: string[]) {
  stopNames.sort();
  for (const stopName of stopNames) {
    addStopToList(stopName)
  }
}

const stopNames = [
  'Oldham Mumps',
  'Freehold',
  'Peel Hall',
  'Velopark',
  'Anchorage',
  'Besses O’ Th’ Barn',
  'Wythenshawe Town Centre',
  'Piccadilly Gardens',
]

addListToStopList(stopNames)
export default function StopsDropDown({
  setResult,
  handleResults,
}: StopsDropDownProps) {
  const [dropDownVisible, setDropDownVisible] = useState(true)
  const [stop, setStop] = useState('')

  function handlePress() {
    const filter: string = "?$filter=StationLocation eq '" + stop + "'"
    const query = 'https://api.tfgm.com/odata/Metrolinks' + filter
    void fetch(query, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': 'b2f7a4b706de42af87d751cc83f4cdae',
      },
    }).then((response) => {
      console.log(response)
      if (!response.ok) {
        throw new Error(response.statusText)
      } else {
        console.log(response)
        void responseToJSON(response).then((responseJSON) => {
          // console.log(responseJSON)
          handleResults(responseJSON)
        })
      }
    })
  }

  return (
    <View
      style={{
        width: '80%',
      }}
    >
      <View style={stylesDropDown.dropDown}>
        <DropDown
          label={'Choose a stop'}
          mode={'outlined'}
          visible={dropDownVisible}
          onDismiss={() => setDropDownVisible(false)}
          showDropDown={() => setDropDownVisible(true)}
          value={stop}
          setValue={setStop}
          list={listOfStops}
        />
      </View>
      <Button mode="contained" onPress={() => handlePress()}>
        See results
      </Button>
    </View>
  )
}

async function responseToJSON(response: Response) {
  return response.json().then((returnVal) => {
    return returnVal
  })
}

const stylesDropDown = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    paddingBottom: 24,
  },
  dropDown: {
    paddingBottom: 20,
  },
})
