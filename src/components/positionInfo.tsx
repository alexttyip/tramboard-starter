import { useFonts } from 'expo-font'
import React, { useState, useEffect } from 'react'
import { Platform, Text, View, StyleSheet, FlatList } from 'react-native'

import * as Location from 'expo-location'
import { Button } from 'react-native-paper'
import departuresFromStation from '../clients/departuresFromStation'
import { filterStationData } from '../clients/findStationLocations'
import { formatNumber } from '../helpers/textFormat'
import NextTramTime from './nextTramTime'

export default function LocationInfo() {
  const [location, setLocation] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const [latlng, setlatlng] = useState([53, -2.2])
  const [userLocation, setUserLocation] = useState('')
  const [departures, setDepartures] = useState<
    { destination: string; time: string }[]
  >([])
  useEffect(() => {
    ;(async () => {
      let { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied')
        return
      }

      let location = await Location.getCurrentPositionAsync({})
      setLocation(location)
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

  let text = 'Waiting..'
  if (errorMsg) {
    text = errorMsg
  } else if (location) {
    text = JSON.stringify(location)
  }

  return (
    <View style={styles.outerView}>
      <View style={styles.mainView}>
        <Button
          onPress={() => {
            void (async () => {
              let localUserLocation = await filterStationData(
                latlng[0],
                latlng[1]
              )
              setUserLocation(localUserLocation)
              let newLiveLocations = await departuresFromStation(
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
          >
            {' '}
          </NextTramTime>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: '#947100',
    marginTop: 8,
    borderRadius: 8,
    width: 250,
  },
  text: {
    fontFamily: 'VictorMono',
    color: 'white',
  },
  textBold: {
    fontFamily: 'Oswald',
    fontWeight: 'bold',
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
  },
  findStationButton: {
    width: 250,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  outerView: {
    display: 'flex',
    alignItems: 'center',
  },
})
