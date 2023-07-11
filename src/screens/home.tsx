import { Linking, StyleSheet, View } from "react-native";
import { Button, Text } from 'react-native-paper'
import StopsDropDown from '../components/dropDownStops'
import { ScreenNavigationProps } from '../routes'

type HomeScreenProps = ScreenNavigationProps<'Home'>

const HomeScreen = ({ navigation }: HomeScreenProps) => (
  <View style={styles.container}>
    <Text style={styles.text}>Tram Times</Text>
    <StopsDropDown />
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
