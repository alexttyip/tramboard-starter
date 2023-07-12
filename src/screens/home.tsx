import { useState } from 'react'
import { StyleSheet, View, Linking, FlatList } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { red50 } from "react-native-paper/lib/typescript/src/styles/themes/v2/colors";
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
  value: TFGMResponse[]
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [departures, setDepartures] = useState<
    { destination: string; time: string }[]
  >([])
  const [station, setStation] = useState('')
  const liveDepartures: { destination: string; time: string }[] = []
  const uniqueCheck: string[] = []

  function addUniqueDepartureEntry(jsonObject: TFGMResponse, i: number) {
    if (jsonObject['Wait' + String(i)]) {
      const destinationTime = {
        destination: jsonObject['Dest' + String(i)],
        time: jsonObject['Wait' + String(i)],
      }
      const departureString = String(
        String(jsonObject['Dest' + String(i)] + jsonObject['Wait' + String(i)])
      )
      if (!uniqueCheck.includes(departureString)) {
        liveDepartures.push(destinationTime)
        uniqueCheck.push(departureString)
      }
    }
  }

  function extractDepartureFromApiObject({
    jsonObject,
  }: {
    jsonObject: TFGMResponse
  }) {
    for (let i = 0; i < 4; i++) {
      addUniqueDepartureEntry(jsonObject, i)
    }
  }

  function spacePadString(numString: string) {
    if (numString.length === 1) {
      return '  ' + numString
    } else {
      return numString
    }
  }

  function formatNumber(numString: string) {
    if (numString === '0') {
      return '  Due    '
    }
    return spacePadString(numString) + ' mins'
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
      {/*<Button mode="contained" onPress={() => navigation.navigate('Details')}>*/}
      {/*  Go to details*/}
      {/*</Button>*/}
      <SelectDropdown
        defaultButtonText="Choose a tram stop"
        data={tramStops}
        onSelect={(selectedItem: string) => {
          setStation(selectedItem)
        }}
        buttonStyle={styles.dropdown}
        buttonTextStyle={styles.text}
        rowTextStyle={styles.text}
        rowStyle={styles.dropdownRow}
        dropdownOverlayColor={'black'}
        search={true}
      />
      <Button
        onPress={() => {
          void fetchDataFromTFGMApi(station)
        }}
        style={styles.buttonStyle}
      >
        <Text style={styles.textBold}>Submit</Text>
      </Button>

      <FlatList
        data={departures}
        renderItem={({ item }) => (
          <Text style={styles.text}>
            {formatNumber(item.time)} --- {item.destination}
          </Text>
        )}
      />
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    fontFamily: 'Avenir',
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  text: {
    fontFamily: 'Avenir',
    color: 'white',
  },
  textBold: {
    marginTop: 10,
    fontFamily: 'Avenir',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
  },
  dropdown: {
    marginTop: 25,
    fontFamily: 'Avenir',
    backgroundColor: '#e67300',
    width: 200,
    borderRadius: 25,
    color: 'white',
  },
  dropdownRow: {
    backgroundColor: '#1a1a1a',
  },
  buttonStyle: {
    paddingTop: 10,
    height: 50,
  }
})
