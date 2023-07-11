import { Link } from '@react-navigation/native'
import { StackHeaderProps } from '@react-navigation/stack'
import { useState } from 'react'
import { Linking, StyleSheet, View } from 'react-native'
import { Appbar, Button, Text } from 'react-native-paper'
import { getEqualHitSlop } from '../helpers/hitSlopHelper'
import DropDown from 'react-native-paper-dropdown'

export default function StopsDropDown() {
  const [dropDownVisible, setDropDownVisible] = useState(true)
  const [stop, setStop] = useState('')
  const listOfStops = [
    {
      label: 'Oldham Mumps',
      value: 'oldham-mumps-tram',
    },
    {
      label: 'Peel Hall',
      value: 'peel-hall-tram',
    },
    {
      label: 'Freehold',
      value: 'freehold-tram',
    },
    {
      label: 'Velopark',
      value: 'velopark-tram',
    },
    {
      label: 'Anchorage',
      value: 'anchorage-tram',
    },
    {
      label: "Besses o' th' Barn",
      value: 'besses-o-th-barn-tram',
    },
    {
      label: 'Wythenshawe Town Centre',
      value: 'wythenshawe-town-centre-tram',
    },
  ]
  return (
    <View
      style={{
        width: '80%',
      }}
    >
      <DropDown
        label={'Stops'}
        mode={'outlined'}
        visible={dropDownVisible}
        onDismiss={() => setDropDownVisible(false)}
        showDropDown={() => setDropDownVisible(true)}
        value={stop}
        setValue={setStop}
        list={listOfStops}
      />
      <Text style={styles.text}>{'\n'}</Text>
      <Button
        mode="contained"
        onPress={() =>
          Linking.openURL(
            'https://tfgm.com/public-transport/tram/stops/' + stop
          )
        }
      >
        Go to details
      </Button>
    </View>
  )
}

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
