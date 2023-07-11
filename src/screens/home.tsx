import { useState } from 'react'
import { StyleSheet, View, Linking } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { ScreenNavigationProps } from '../routes'
import SelectDropdown from 'react-native-select-dropdown'

type HomeScreenProps = ScreenNavigationProps<'Home'>
const tramStops = [
  'St. Peters Square',
  'Chorlton',
  'Old Trafford',
  'Cornbrook',
  'Firswood',
]

const urlDict: { [id: string]: string } = {
  'St. Peters Square': 'st-peters-square-tram',
  Chorlton: 'chorlton-tram',
  'Old Trafford': 'old-trafford-tram',
  Cornbrook: 'cornbrook-tram',
  Firswood: 'firswood-tram',
}

async function tfgmWebstie(station: string) {
  await Linking.openURL(
    'https://tfgm.com/public-transport/tram/stops/' + urlDict[station]
  ).then()
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
        defaultButtonText="Choose a tram stop"
        data={tramStops}
        onSelect={(selectedItem: string) => {
          setStation(selectedItem)
        }}
        buttonTextAfterSelection={(selectedItem: string) => {
          return selectedItem
        }}
        rowTextForSelection={(item: string) => {
          return item
        }}
      />
      <Button onPress={() => void tfgmWebstie(station)}>Submit</Button>
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
