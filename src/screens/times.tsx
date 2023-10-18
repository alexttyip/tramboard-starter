import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'

const TimesScreen = () => (
  <View style={styles.container}>
    <Text>Times Screen</Text>
  </View>
)

export default TimesScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
