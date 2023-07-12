import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'

const DetailsScreen = () => (
  <View style={styles.container}>
    <Text>Details</Text>
  </View>
)

export default DetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
