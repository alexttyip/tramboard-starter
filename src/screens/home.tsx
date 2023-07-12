import { useState } from 'react'
import { StyleSheet, View, Linking, FlatList } from 'react-native'
import { Button, Text } from 'react-native-paper'
import * as repl from 'repl'
import { ScreenNavigationProps } from '../routes'
import SelectDropdown from 'react-native-select-dropdown'

type HomeScreenProps = ScreenNavigationProps<'Home'>
const tramStops = [
  'St Peter\'\'s Square',
  'Chorlton',
  'Old Trafford',
  'Cornbrook',
  'Firswood',
]

// function stopNameToUrl(stopName: string): string {
//   const lower = stopName.toLowerCase()
//   const replaced = lower.replaceAll(' ', '-').replaceAll("'", '')
//   const final = replaced + '-tram'
//   return final
// }

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [departures, setDepartures] = useState([])
  const [station, setStation] = useState('')
  const liveDepartures: object[] = []
  const uniqueCheck: string[] = []
  function extractData({ jsonObject }: { jsonObject: never }) {
    for (let i = 0; i < 4; i++) {
      if (jsonObject['Wait' + i]) {
        // console.log(jsonObject['Dest' + i], jsonObject['Wait' + i], i)
        const destinationTime = {
          destination: jsonObject['Dest' + String(i)],
          time: jsonObject['Wait' + String(i)],
        }
        const departureString: string =
          jsonObject['Dest' + String(i)] + jsonObject['Wait' + String(i)]
        if (!uniqueCheck.includes(departureString)) {
          liveDepartures.push(destinationTime)
          uniqueCheck.push(departureString)
        }
      }
    }
  }
  const tfgmAPI = async (station: string) => {
    try {
      const response: Response = await fetch(
        'https://api.tfgm.com/odata/Metrolinks?$filter=StationLocation eq ' +
          '\'' +
          station +
          '\'',
        {
          method: 'GET',
          headers: {
            'Ocp-Apim-Subscription-Key': '9d4ee66434a74bb980397d0ac64eeef0',
          },
        }
      )
      const json = await response.json()
      for (const obj of json.value) {
        extractData({ jsonObject: obj })
      }
      const apiForFlatList = liveDepartures.map((stop) => {
        return { key: stop }
      })
      liveDepartures.sort((a, b) => (Number(a.time) < Number(b.time) ? -1 : 1))
      setDepartures(liveDepartures)
      return json
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
      <Button mode="contained" onPress={() => navigation.navigate('Details')}>
        Go to details
      </Button>
      <SelectDropdown
        defaultButtonText="Choose a tram stop"
        data={tramStops}
        onSelect={(selectedItem: string) => {
          setStation(selectedItem)
        }}
      />
      {/*<Button onPress={() => void tfgmWebstie(station)}>Submit</Button>*/}
      <Button
        onPress={() => {
          void tfgmAPI(station)
        }}
      >
        Submit
      </Button>

      <FlatList
        data={departures}
        renderItem={({ item }) => (
          <Text>
            {item.destination} --- {item.time}
          </Text>
        )}
      />
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    paddingBottom: 24,
  },
})
