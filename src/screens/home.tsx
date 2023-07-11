import { useState } from 'react'
import { StyleSheet, View, Linking } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { ScreenNavigationProps } from '../routes'
import SelectDropdown from 'react-native-select-dropdown'

type HomeScreenProps = ScreenNavigationProps<'Home'>
const countries = [
  'St. Peters Square',
  'Chorlton',
  'Old Trafford',
  'Cornbrook',
  'Firswood',
]

const urlDict = { 'St. Peters Square': 'st-peters-square-tram', 'Chorlton':'chorlton-tram', 'Old Trafford': 'old-trafford-tram', 'Cornbrook': 'cornbrook-tram', 'Firswood': 'firswood-tram', }

function tfgmWebstie(station: string) {
  console.log(urlDict[station])
  Linking.openURL('https://tfgm.com/public-transport/tram/stops/'+ urlDict[station]).then()
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const [station, setStation] = useState('')
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
      <Button mode="contained" onPress={() => navigation.navigate('Details')}>
        Go to details
      </Button>

      <SelectDropdown
        data={countries}
        onSelect={(selectedItem: string, index) => {
          setStation(selectedItem)
          console.log(selectedItem, index)
        }}
        buttonTextAfterSelection={(selectedItem: string, index) => {
          // text represented after item is selected
          // if data array is an array of objects then return selectedItem.property to render after item is selected
          return selectedItem
        }}
        rowTextForSelection={(item: string, index) => {
          // text represented for each item in dropdown
          // if data array is an array of objects then return item.property to represent item in dropdown
          return item
        }}
      />
      <Button onPress={() => tfgmWebstie( station )}>Submit</Button>
    </View>
  )
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
})
