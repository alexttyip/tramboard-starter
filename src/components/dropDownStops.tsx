import React, { Dispatch, SetStateAction, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import SelectDropdown from 'react-native-select-dropdown'
import { Station } from '../screens/home'
import { getStopData } from '../clients/APICalls'

type StopsDropDownProps = {
  setResult: Dispatch<SetStateAction<string>>
  handleResults: (st: Station) => void
  setStation: React.Dispatch<React.SetStateAction<string>>
  setStopsDropDownVisible: React.Dispatch<React.SetStateAction<boolean>>
}

const stopNames = [
  'Abraham Moss',
  'Altrincham',
  'Anchorage',
  'Ashton Moss',
  'Ashton West',
  'Ashton-Under-Lyne',
  'Audenshaw',
  'Baguley',
  'Barlow Moor Road',
  'Barton Dock Road',
  'Benchill',
  'Besses O’ Th’ barn',
  'Bowker Vale',
  'Broadway',
  'Brooklands',
  'Burton Road',
  'Bury Interchange',
  'Cemetery Road',
  'Central Park',
  'Chorlton',
  'Clayton Hall',
  'Cornbrook',
  'Crossacres',
  'Crumpsall',
  'Dane Road',
  'Deansgate-Castlefield',
  'Derker',
  'Didsbury Village',
  'Droylsden',
  'East Didsbury',
  'Eccles',
  'Edge Lane',
  'Etihad Campus',
  'Exchange Quay',
  'Exchange Square',
  'Failsworth',
  'Firswood',
  'Freehold',
  'Harbour City',
  'Heaton Park',
  'Hollinwood',
  'Holt Town',
  'Imperial War Museum',
  'Kingsway',
  'Ladywell',
  'Langworthy',
  'Manchester Airport',
  'Market Street',
  'Martinscroft',
  'MediaCityUK',
  'Milnrow',
  'Monsall',
  'Moor Road',
  'Navigation Road',
  'New Islington',
  'Newbold',
  'Newhey',
  'Newton Heath & Moston',
  'Northern Moor',
  'Old Trafford',
  'Oldham Central',
  'Oldham King Street',
  'Oldham Mumps',
  'Parkway',
  'Peel Hall',
  'Piccadilly Gardens',
  'Piccadilly',
  'Pomona',
  'Prestwich',
  'Queens Road',
  'Radcliffe',
  'Robinswood Road',
  'Rochdale Interchange',
  'Rochdale Railway Station',
  'Roundthorn',
  'Sale',
  'Sale Water Park',
  'Salford Quays',
  'Shadowmoss',
  'Shaw and Crompton',
  'Shudehill',
  'South Chadderton',
  'St Peter\'s Square',
  'St Werburgh’s Road',
  'Stretford',
  'The Trafford Centre',
  'Timperley',
  'Trafford Bar',
  'Velopark',
  'Victoria',
  'Village',
  'Weaste',
  'West Didsbury',
  'Westwood',
  'Wharfside',
  'Whitefield',
  'Withington',
  'Woodlands Road',
  'Wythenshawe Park',
  'Wythenshawe Town Centre',
]
//’
export default function StopsDropDown({
  setResult,
  handleResults,
  setStation,
  setStopsDropDownVisible,
}: StopsDropDownProps) {
  const [stop, setStop] = useState('')

  async function handlePress() {
    if (stop.length === 0) {
      return
    }
    setStation(stop)
    setStopsDropDownVisible(false)
    const filter: string =
      '?$filter=StationLocation eq \'' + stop.replace('\'', '\'\'') + "'"
    const results = await getStopData(filter)
    handleResults(results)
  }

  return (
    <View
      style={{
        width: '80%',
        height: '80%',
        marginTop: '50%',
        alignSelf: 'center',
      }}
    >
      <View>
        <SelectDropdown
          data={stopNames}
          onSelect={setStop}
          search={true}
          rowStyle={stylesDropDown.rowStyle}
          buttonStyle={stylesDropDown.dropDown}
          defaultButtonText={'Select a tram stop'}
        />
      </View>
      <Button
        style={stylesDropDown.button}
        mode="contained"
        onPress={async () => await handlePress()}
      >
        See tram times
      </Button>
    </View>
  )
}

const stylesDropDown = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    paddingBottom: 24,
  },
  dropDown: {
    paddingBottom: 20,
    alignSelf: 'center',
    width: '80%',
  },
  button: {
    marginBottom: 20,
    paddingTop: 5,
    paddingBottom: 5,
  },
  rowStyle: {
    width: '100%',
  },
})
