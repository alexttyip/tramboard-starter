import { StyleSheet, View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import { ScreenNavigationProps } from '../routes'

type HomeScreenProps = ScreenNavigationProps<'Home'>

const HomeScreen = ({ navigation }: HomeScreenProps) => (
  <View style={styles.container}>
    <Text style={styles.text}>Home Screen</Text>
    <Button mode="contained" onPress={() => navigation.navigate('Details')}>
      Go to details
    </Button>
    <Button mode="contained" onPress={() => navigation.navigate('Times')}>
      Go to times
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
  },
})
