import { useState } from 'react'
import { StyleSheet, View, FlatList } from 'react-native'
import { Button, Text } from 'react-native-paper'
import NextTramTime from '../components/nextTramTime'
import { ScreenNavigationProps } from '../routes'
import SelectDropdown from 'react-native-select-dropdown'
import React from 'react'
import departuresFromStation from '../clients/departuresFromStation'
import { formatNumber } from '../helpers/textFormat'
import { stationNameListFromtfgmApi } from '../clients/departuresFromStation'
import { useFonts } from 'expo-font'

type HomeScreenProps = ScreenNavigationProps<'Home'>

let newLiveLocations = []

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [departures, setDepartures] = useState<
    { destination: string; time: string }[]
  >([])
  const [station, setStation] = useState('')
  const [stationList, setStationList] = useState<string[]>([])
  const [loaded] = useFonts({
    VictorMono: require('../../assets/fonts/VictorMono-Regular.ttf'),
    Oswald: require('../../assets/fonts/Oswald-Regular.ttf'),
  })
  if (!loaded) {
    return null
  }
  return (
    <View style={styles.container}>
      <View style={styles.mainView}>
        <Button onPress={() => navigation.navigate('Details')}>
          <Text style={styles.nextPageButton}>Find Closest Station</Text>
        </Button>
      </View>
      <SelectDropdown
        defaultButtonText="Choose Tram Stop &#9660;"
        data={stationList}
        onSelect={(selectedItem: string) => {
          setStation(selectedItem)
        }}
        buttonStyle={styles.dropdown}
        buttonTextStyle={styles.dropdownButtonText}
        rowTextStyle={styles.text}
        rowStyle={styles.dropdownRow}
        dropdownOverlayColor={'black'}
        search={true}
        onFocus={() => {
          void (async () => {
            setStationList(await stationNameListFromtfgmApi())
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
          <NextTramTime
            dueTime={formatNumber(item.time)}
            destinationName={item.destination}
          >
            {' '}
          </NextTramTime>
        )}
      />
      {/*<Button*/}
      {/*  onPress={() => {*/}
      {/*    void (async () => {*/}
      {/*      await filterStationData()*/}
      {/*    })()*/}
      {/*  }}*/}
      {/*  style={styles.buttonStyle}*/}
      {/*>*/}
      {/*  <Text style={styles.textBold}>Location Finder</Text>*/}
      {/*</Button>*/}
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    // fontFamily: 'Avenir',
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  text: {
    fontFamily: 'Oswald',
    color: 'white',
  },
  textBold: {
    marginTop: 10,
    fontFamily: 'VictorMono',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 18,
  },
  dropdown: {
    marginTop: 25,
    fontFamily: 'Oswald',
    backgroundColor: 'black',
    width: 250,
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
  dropdownButtonText: {
    fontFamily: 'VictorMono',
    color: 'white',
    fontSize: 18,
  },
  nextPageButton: {
    fontFamily: 'Oswald',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 13,
  },
  mainView: {
    backgroundColor: '#947100',
    marginLeft: 'auto',
    marginRight: 8,
    marginTop: 8,
    borderRadius: 8,
  },
})
