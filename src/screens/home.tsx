import { useState } from 'react'
import { StyleSheet, View, Linking, FlatList } from 'react-native'
import { Button, Text } from 'react-native-paper'
import * as repl from 'repl'
import { config } from '../config'
import { ScreenNavigationProps } from '../routes'
import SelectDropdown from 'react-native-select-dropdown'

type HomeScreenProps = ScreenNavigationProps<'Home'>
const tramStops = [
  "St Peter''s Square",
  'Chorlton',
  'Old Trafford',
  'Cornbrook',
  'Firswood',
]

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [departures, setDepartures] = useState<
    { destination: string; time: string }[]
  >([])
  const [station, setStation] = useState('')
  const liveDepartures: { destination: string; time: string }[] = []
  const uniqueCheck: string[] = []
  function extractDepartureFromApiObject({
    jsonObject,
  }: {
    jsonObject: TFGMResponse
  }) {
    for (let i = 0; i < 4; i++) {
      if (jsonObject['Wait' + String(i)]) {
        const destinationTime = {
          destination: jsonObject['Dest' + String(i)],
          time: jsonObject['Wait' + String(i)],
        }
        const departureString = String(
          String(
            jsonObject['Dest' + String(i)] + jsonObject['Wait' + String(i)]
          )
        )
        if (!uniqueCheck.includes(departureString)) {
          liveDepartures.push(destinationTime)
          uniqueCheck.push(departureString)
        }
      }
    }
  }

  interface TFGMResponse {
    [index: string]: string
    Dest0: string
    Dest1: string
    Dest2: string
    Dest3: string
    Wait0: string
    Wait1: string
    Wait2: string
    Wait3: string
  }

  interface TFGMRawResponse {
    // [index: string]: string
    value: TFGMResponse[]
  }

  const fetchDataFromTFGMApi = async (station: string) => {
    try {
      const response: Response = await fetch(
        `https://api.tfgm.com/odata/Metrolinks?$filter=StationLocation eq '${station}'`,
        {
          method: 'GET',
          headers: {
            'Ocp-Apim-Subscription-Key': config.apiKey,
          },
        }
      )
      const json = (await response.json()) as TFGMRawResponse
      for (const obj of json.value) {
        extractDepartureFromApiObject({ jsonObject: obj })
      }
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
      <Button
        onPress={() => {
          void fetchDataFromTFGMApi(station)
        }}
      >
        Submit
      </Button>

      <FlatList
        data={departures}
        renderItem={({ item }) => (
          <Text>
            {item.destination} --- {item.time} mins
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
