import React from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import { Departure } from '../screens/home'
import tram1 from './tram1.png'
import tram2 from './tram2.png'

type detailsProps = {
  details: Departure[]
}
const DetailsScreen = ({ details }: detailsProps) => {
  const formattedTimes = details === null ? <></> : mapDetails(details)
  return (
    <ScrollView style={styles.details}>
      <View>{formattedTimes}</View>
    </ScrollView>
  )
}

function mapDetails(details: Departure[]) {
  let counter = 0
  return details.map((departure: Departure) => {
    return (
      <View style={styles.departures} key={counter++}>
        <View style={{ paddingLeft: 15, width: '75%' }}>
          <Text style={{ fontSize: 18 }}>{departure['destination']}</Text>
          <Text style={{ fontSize: 12 }}>
            {'Platform ' + departure['platformNumber']}
          </Text>
          <Image
            style={departure.isSingle ? styles.singleTram : styles.doubleTram}
            source={departure.isSingle ? tram1 : tram2}
          />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 2 }}>
          <Text style={{ fontSize: 40, alignContent: 'flex-end' }}>
            {departure['waitTime'] === 0 ? 'Due' : departure['waitTime']}
          </Text>
          <Text
            style={{
              fontSize: 10,
              alignContent: 'flex-end',
              paddingTop: 32,
            }}
          >
            {departure['waitTime'] === 0 ? '' : ' min'}{' '}
          </Text>
        </View>
      </View>
    )
  })
}
export default DetailsScreen

const styles = StyleSheet.create({
  departures: {
    marginBottom: 20,
    backgroundColor: 'yellow',
    textDecorationStyle: 'solid',
    paddingBottom: 15,
    paddingTop: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 10,
  },
  singleTram: {
    height: 20,
    width: 60,
  },
  doubleTram: {
    height: 20,
    width: 120,
  },
  details: {
    height: '70%',
    width: '80%',
  },
})
