import { useFonts } from 'expo-font'
import { View, Text, StyleSheet } from 'react-native'

type tramBoxProp = {
  destinationName: string
  dueTime: string
}
const TramBox = ({ destinationName, dueTime }: tramBoxProp) => {
  const [loaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    VictorMono: require('../../assets/fonts/VictorMono-Regular.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Oswald: require('../../assets/fonts/Oswald-Regular.ttf'),
  })
  if (!loaded) {
    return null
  }
  return (
    <View style={styles.mainView}>
      <View>
        <Text style={styles.text}>{destinationName}</Text>
      </View>
      <View>
        <Text style={styles.text}>{dueTime}</Text>
      </View>
    </View>
  )
}

export default TramBox

const styles = StyleSheet.create({
  mainView: {
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#947100',
    width: 300,
    margin: 2,
    padding: 5,
    borderRadius: 3,
  },
  text: {
    fontSize: 20,
    fontFamily: 'Oswald',
    color: 'white',
  },
})
