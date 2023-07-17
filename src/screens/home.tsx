import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { ScreenNavigationProps } from '../routes'

type HomeScreenProps = ScreenNavigationProps<'Home'>

const HomeScreen = ({ navigation }: HomeScreenProps) => (
  <View style={styles.container}>
    <Text style={styles.text}>Home Screen</Text>
    <Button
      dark={false}
      style={styles.button}
      mode="contained"
      onPress={() => navigation.navigate('Details')}
    >
      Find Stop Details
    </Button>
    <Button
      style={styles.button}
      dark={false}
      mode="contained"
      onPress={() => navigation.navigate('Nearest')}
    >
      Find Your Nearest Stop
    </Button>
  </View>
)

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
    fontSize: 28,
  },
  button: {
    marginTop: 15,
    color: 'black',
    backgroundColor: '#ffec44',
    borderColor: '#000000',
    borderWidth: 1,
    overflow: 'hidden',
  },
})
