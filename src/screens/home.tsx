import React, { Dispatch, SetStateAction, useState } from 'react'
import { Linking, StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'
import StopsDropDown from '../components/dropDownStops'
import { ScreenNavigationProps } from '../routes'

type HomeScreenProps = ScreenNavigationProps<'Home'>
type Departure = {
  destination: string
  waitTime: number
}
export type Station = {
  value: Board[]
}

type Board = {
  Wait0: string
  Dest0: string
  Wait1: string
  Dest1: string
  Wait2: string
  Dest2: string
  Wait: string
  Dest3: string
  AtcoCode: string
}
const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [details, setDetails] = useState<Departure[]>([])

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
        let waitTimeString: string = boardInfo[waitKey]
        if (waitTimeString.length === 0) {
          break
        }
        departureTimes.push({
          destination: boardInfo[destKey],
          waitTime: ++waitTimeString,
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
          <Text
            style={styles.departures}
            key={departure['destination'] + departure['waitTime']}
          >
            {departure['destination']} {departure['waitTime']}
          </Text>
        )
      })
    )
  //console.log(details)
  const view = (
    <>
      <View style={styles.container}>
        <StopsDropDown setResult={setDetails} handleResults={handleResults} />
        <View style={styles.details}>{formattedTimes}</View>
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
    textAlign: 'center',
    textDecorationStyle: 'solid',
    paddingBottom: 10,
    paddingTop: 10,
  },
})
