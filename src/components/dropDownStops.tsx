import { Link } from "@react-navigation/native";
import { StackHeaderProps } from '@react-navigation/stack'
import { useState } from 'react'
import { Linking, StyleSheet, View } from "react-native";
import { Appbar, Button, Text } from "react-native-paper";
import { getEqualHitSlop } from '../helpers/hitSlopHelper'
import DropDown from 'react-native-paper-dropdown'

export default function StopsDropDown() {
  const [dropDownVisible, setDropDownVisible] = useState(true)
  const [stop, setStop] = useState('')
  const listOfStops = [
    {
      label: 'Oldham Mumps',
      value: 'https://tfgm.com/public-transport/tram/stops/oldham-mumps-tram',
    },
    {
      label: 'Peel Hall',
      value: 'https://tfgm.com/public-transport/tram/stops/peel-hall-tram',
    },
    {
      label: 'Freehold',
      value: 'https://tfgm.com/public-transport/tram/stops/freehold-tram',
    },
    {
      label: 'Velopark',
      value: 'https://tfgm.com/public-transport/tram/stops/velopark-tram',
    },
    {
      label: 'Anchorage',
      value: 'https://tfgm.com/public-transport/tram/stops/anchorage-tram',
    },
    {
      label: "Besses o' th' Barn",
      value: 'https://tfgm.com/public-transport/tram/stops/besses-o-th-barn-tram',
    },
    {
      label: 'Wythenshawe Town Centre',
      value: 'https://tfgm.com/public-transport/tram/stops/wythenshawe-town-centre-tram',
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
          Linking.openURL(stop)
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
