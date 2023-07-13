import React, { Dispatch, SetStateAction, useState, useEffect } from 'react'
import { Linking, ScrollView, StyleSheet, View, Image } from 'react-native'
import { Button, Text } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'
import StopsDropDown from '../components/dropDownStops'
import { ScreenNavigationProps } from '../routes'
import DetailsScreen from './details'
import tram1 from './tram1.png'
import tram2 from './tram2.png'

type HomeScreenProps = ScreenNavigationProps<'Home'>

export type Departure = {
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
  const [dropDownVisible, setDropDownVisible] = useState(true)
  const [station, setStation] = useState('')
  const [pageContent, setPageContent] = useState(<></>)
  useEffect(() => setPageContent(showDropDown()), [dropDownVisible])
  function handleResults(stationInfo: Station) {
    //console.log(stationInfo)
    const boardsInfo: Board[] = stationInfo['value']
    const departureTimes: Departure[] = []
    const handledPlatforms: Set<string> = new Set()
    for (const boardInfo of boardsInfo) {
      //console.log(boardInfo)
      if (handledPlatforms.has(boardInfo['AtcoCode'])) {
        continue
      }
      handledPlatforms.add(boardInfo['AtcoCode'])
      for (let i = 0; i <= 3; i++) {
        const waitKey = 'Wait' + i
        const destKey = 'Dest' + i
        const carriagesKey = 'Carriages' + i
        const platformChar =
          boardInfo['AtcoCode'][boardInfo['AtcoCode'].length - 1]
        const waitTimeString: string = boardInfo[waitKey]
        if (waitTimeString.length === 0) {
          break
        }
        departureTimes.push({
          destination: boardInfo[destKey],
          waitTime: +waitTimeString,
          platformNumber:
            platformChar <= '9' && platformChar >= '1' ? platformChar - '0' : 1,
          isSingle: boardInfo[carriagesKey] === 'Single',
        })
      }
    }

    departureTimes.sort((a, b) => {
      return a.waitTime - b.waitTime
    })

    setDetails(departureTimes)
  }
  function showDropDown(): JSX.Element {
    if (dropDownVisible) {
      return (
        <StopsDropDown
          setResult={setDetails}
          handleResults={handleResults}
          setStation={setStation}
          setStopsDropDownVisible={setDropDownVisible}
        />
      )
    } else {
      return (
        <View>
          <Text>Tram departures from {station}</Text>
          <Button onPress={() => setDropDownVisible(true)}>
            Choose another stop
          </Button>l
            <DetailsScreen details={details} />
        </View>
      )
    }
  }
  //console.log(details)
  const view = <>{pageContent}</>
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
