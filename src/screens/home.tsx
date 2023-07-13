import React, { Dispatch, SetStateAction, useState } from 'react'
import { Linking, ScrollView, StyleSheet, View, Image } from 'react-native'
import { Button, Text } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'
import StopsDropDown from '../components/dropDownStops'
import { ScreenNavigationProps } from '../routes'
import tram1 from './tram1.png'
import tram2 from './tram2.png'

type HomeScreenProps = ScreenNavigationProps<'Home'>
type Departure = {
  destination: string
  waitTime: number
  platformNumber: number
  isSingle: boolean
}
export type Station = {
  value: Board[]
}

type Board = {
  Wait0: string
  Dest0: string
  Carriages0: string
  Wait1: string
  Dest1: string
  Carriages1: string
  Wait2: string
  Dest2: string
  Carriages2: string
  Wait3: string
  Dest3: string
  Carriages3: string
  AtcoCode: string
}
const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [details, setDetails] = useState<Departure[]>([])
  let counter = 0

  function handleResults(stationInfo: Station) {
    console.log(stationInfo)

    const boardsInfo: Board[] = stationInfo['value']
    const departureTimes: Departure[] = []
    const handledPlatforms: Set<string> = new Set()
    for (const boardInfo of boardsInfo) {
      console.log(boardInfo)
      if (handledPlatforms.has(boardInfo['AtcoCode'])) {
        continue
      }
      handledPlatforms.add(boardInfo['AtcoCode'])
      for (let i = 0; i <= 3; i++) {
        const waitKey = 'Wait' + i
        const destKey = 'Dest' + i
        const carriagesKey = 'Carriages' + i
        const platformChar = boardInfo['AtcoCode'][boardInfo['AtcoCode'].length - 1]
        const waitTimeString: string = boardInfo[waitKey]
        if (waitTimeString.length === 0) {
          break
        }
        departureTimes.push({
          destination: boardInfo[destKey],
          waitTime: +waitTimeString,
          platformNumber: (platformChar <= '9' && platformChar >= '1' ? platformChar - '0' : 1),
          isSingle: boardInfo[carriagesKey] === 'Single',
        })
      }
    }

    departureTimes.sort((a, b) => {
      return a.waitTime - b.waitTime
    })

    setDetails(departureTimes)
  }

  const formattedTimes =
    details === null ? (
      <></>
    ) : (
      details.map((departure: Departure) => {
        return (
          <View
            style={styles.departures}
            key={counter++}
          >
            <View style={{ paddingLeft: 15, width: '75%' }}>
              <Text style={{ fontSize: 18 }}>{departure['destination']}</Text>
              <Text style={{ fontSize: 12 }}>{'Platform ' + departure['platformNumber']}</Text>
              <Image style={departure.isSingle? styles.singleTram: styles.doubleTram} source={departure.isSingle? tram1 : tram2} />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', }}>
              <Text style={{ fontSize: 40, alignContent: 'flex-end' }}>
                {departure['waitTime'] === 0 ? 'Due' : departure['waitTime']}
              </Text>
              <Text style={{ fontSize: 10, alignContent: 'flex-end', paddingTop: 32}}>
                {departure['waitTime'] === 0 ? '' : ' min'}{' '}
              </Text>
            </View>
          </View>
        )
      })
    )
  //console.log(details)
  const view = (
    <>
      <View style={styles.container}>
        <StopsDropDown setResult={setDetails} handleResults={handleResults} />
        <ScrollView style={styles.details}>{formattedTimes}</ScrollView>
      </View>
    </>
  )
  return view
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
  details: {
    height: '70%',
    width: '80%',

  },
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
})
