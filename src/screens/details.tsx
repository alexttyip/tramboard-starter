import { useState } from 'react'
import { Linking, StyleSheet, View } from 'react-native'
import { Button } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'

export default function DetailsScreen() {
  const [showDropDown, setShowDropDown] = useState(false)
  const [stop, setStop] = useState('')
  const stops = [
    {
      label: 'Piccadilly Gardens',
      value:
        'https://tfgm.com/public-transport/tram/stops/piccadilly-gardens-tram',
    },
    {
      label: 'Firswood',
      value: 'https://tfgm.com/public-transport/tram/stops/firswood-tram',
    },
    {
      label: 'Sale Water Park',
      value:
        'https://tfgm.com/public-transport/tram/stops/sale-water-park-tram',
    },
    {
      label: 'Parkway',
      value: 'https://tfgm.com/public-transport/tram/stops/parkway-tram',
    },
    {
      label: 'Rochdale Railway Station',
      value:
        'https://tfgm.com/public-transport/tram/stops/rochdale-railway-station-tram',
    },
  ]
  return (
    <View style={styles.container}>
      <DropDown
        label={'Stops'}
        mode={'outlined'}
        visible={showDropDown}
        showDropDown={() => setShowDropDown(true)}
        onDismiss={() => setShowDropDown(false)}
        value={stop}
        setValue={setStop}
        list={stops}
      />
      <View style={{ padding: '2%' }}></View>
      <Button
        mode="outlined"
        onPress={() => {
          void Linking.openURL(stop)
        }}
      >
        Find Times
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '80%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
})
