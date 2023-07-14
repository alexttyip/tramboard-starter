import { useFonts } from 'expo-font'
import React, { useState, useEffect } from 'react'
import { Text, View, StyleSheet, FlatList } from 'react-native'

import * as Location from 'expo-location'
import { Button } from 'react-native-paper'
import departuresFromStation from '../clients/departuresFromStation'
import { filterStationData } from '../clients/findStationLocations'
import { formatNumber } from '../helpers/textFormat'
import NextTramTime from './nextTramTime'

export default function LocationInfo() {
  const [latlng, setlatlng] = useState([53, -2.2])
  const [userLocation, setUserLocation] = useState('')
  const [departures, setDepartures] = useState<
    { destination: string; time: string }[]
  >([])
  useEffect(() => {
    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      const location = await Location.getCurrentPositionAsync({})
      setlatlng([location.coords.latitude, location.coords.longitude])
    })()
  }, [])
  const [loaded] = useFonts({
    VictorMono: require('../../assets/fonts/VictorMono-Regular.ttf'),
    Oswald: require('../../assets/fonts/Oswald-Regular.ttf'),
  })
  if (!loaded) {
    return null
  }

  return (
    <View style={styles.outerView}>
      <View style={styles.mainView}>
        <Button
          onPress={() => {
            setUserLocation('Waiting...')
            void (async () => {
              const localUserLocation: string = await filterStationData(
                latlng[0],
                latlng[1]
              )
              setUserLocation(localUserLocation)
              const newLiveLocations = await departuresFromStation(
                localUserLocation
              )
              setDepartures(newLiveLocations)
            })()
          }}
          style={styles.findStationButton}
        >
          <Text style={styles.textBold}>Find Station</Text>
        </Button>
      </View>
      <Text style={styles.text}>{userLocation}</Text>
      <FlatList
        data={departures}
        renderItem={({ item }) => (
          <NextTramTime
            dueTime={formatNumber(item.time)}
            destinationName={item.destination}
          />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#947100',
    marginTop: 8,
    borderRadius: 20,
    width: 153,
  },
  text: {
    fontFamily: 'VictorMono',
    color: 'white',
  },
  textBold: {
    fontFamily: 'Oswald',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 17,
    textAlign: 'center',
  },
  findStationButton: {
    width: 153,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  outerView: {
    display: 'flex',
    alignItems: 'center',
  },
})
