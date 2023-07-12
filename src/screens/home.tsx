import React, { Dispatch, SetStateAction, useState } from "react";
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

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [details, setDetails] = useState(null)
  const view = (
    <>
      <View style={styles.container}>
        <StopsDropDown setResult={setDetails} handleResults={handleResults} />
        <Text style={styles.details}>{JSON.stringify(details)}</Text>
      </View>
    </>
  )

  function handleResults(stationInfo: NonNullable<unknown>) {
    console.log(stationInfo)

    let boardsInfo = stationInfo['value']
    let departureTimes: Departure[] = []
    for(const boardInfo of boardsInfo) {
      console.log(boardInfo)
      for(let i = 0; i <= 3; i++) {
        let waitKey = 'Wait' + i
        let destKey = 'Dest' + i
        if(boardInfo[waitKey].length === 0) {
          break
        }
        departureTimes.push({destination: boardInfo[destKey], waitTime: ++boardInfo[waitKey]})
      }
    }

    departureTimes.sort((a, b) => {
      return a.waitTime - b.waitTime
    })

    setDetails(departureTimes)
  }

  console.log(details)

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
})
