import { useState } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { ScreenNavigationProps } from '../routes'
import SelectDropdown from 'react-native-select-dropdown'
import React from 'react'
import departuresFromStation from '../clients/departuresFromStation'
import { formatNumber } from '../helpers/textFormat'
import { stationNameListFromTFGMApi } from '../clients/departuresFromStation'

type HomeScreenProps = ScreenNavigationProps<'Home'>

let newLiveLocations = []

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [departures, setDepartures] = useState<
    { destination: string; time: string }[]
  >([])
  const [station, setStation] = useState('')
  const [stationList, setStationList] = useState<string[]>([])

  return (
    <View style={styles.container}>
      {/*<Button mode="contained" onPress={() => navigation.navigate('Details')}>*/}
      {/*  Go to details*/}
      {/*</Button>*/}
      <SelectDropdown
        defaultButtonText="Choose a tram stop"
        data={stationList}
        onSelect={(selectedItem: string) => {
          setStation(selectedItem)
        }}
        buttonStyle={styles.dropdown}
        buttonTextStyle={styles.text}
        rowTextStyle={styles.text}
        rowStyle={styles.dropdownRow}
        dropdownOverlayColor={'black'}
        search={true}
        onFocus={() => {
          void (async () => {
            setStationList(await stationNameListFromTFGMApi())
          })()
        }}
      />
      <Button
        onPress={() => {
          void (async () => {
            newLiveLocations = await departuresFromStation(station)
            setDepartures(newLiveLocations)
          })()
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
  },
})
