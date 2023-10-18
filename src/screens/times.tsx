import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import DropDown from 'react-native-paper-dropdown'

const TimesScreen = () => {
  const [showDropDown, setShowDropDown] = React.useState(false)
  const [stop, setStop] = React.useState('')
  const stopList = [
    {
      label: 'Stop 1',
      value: '1',
    },
    {
      label: 'Stop 2',
      value: '2',
    },
    {
      label: 'Stop 3',
      value: '3',
    },
  ]
  return (
    <View style={styles.container}>
      <Text>Times Screen</Text>
      <DropDown
        label={'Stops'}
        mode={'outlined'}
        visible={showDropDown}
        showDropDown={() => setShowDropDown(true)}
        onDismiss={() => setShowDropDown(false)}
        value={stop}
        setValue={setStop}
        list={stopList}
      />
    </View>
  )
}

export default TimesScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
