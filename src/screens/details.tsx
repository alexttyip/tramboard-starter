import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
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

export default function DetailsScreen() {
  const [showDropDown, setShowDropDown] = useState(false)
  const [stop, setStop] = useState('')

  function handleClick() {
    fetch(tfgmEndpoint, {
      method: 'GET',
      headers: {
        'Ocp-Apim-Subscription-Key': config.apiKey,
      },
    })
      .then((response) => response.json())
      .then((json) => filterJson(json as { value: [{ AtcoCode: string }] }))
      .then((filteredJson) =>
        console.log(JSON.stringify(filteredJson, null, 2))
      )
      .catch((err) => {
        console.log(err)
      })
  }

  function filterJson(json: { value: [{ AtcoCode: string }] }) {
    return json.value.filter((apiStop) => {
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
      <Button mode="outlined" onPress={handleClick}>
        Find Times
      </Button>
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
})
