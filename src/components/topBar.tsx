import { StackHeaderProps } from '@react-navigation/stack'
import { useFonts } from 'expo-font'
import { StyleSheet } from 'react-native'
import { Appbar } from 'react-native-paper'
import { getEqualHitSlop } from '../helpers/hitSlopHelper'

type TopBarProps = StackHeaderProps

const TopBar = ({ navigation, progress }: TopBarProps) => {
  const [loaded] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    VictorMono: require('../../assets/fonts/VictorMono-Bold.ttf'),
  })
  if (!loaded) {
    return null
  }
  return (
    <Appbar.Header style={styles.topBar}>
      {progress.previous && (
        <Appbar.BackAction
          style={styles.backButton}
          hitSlop={getEqualHitSlop(30)}
          onPress={navigation.goBack}
        />
      )}
      <Appbar.Content titleStyle={styles.title} title="Tram Board" />
    </Appbar.Header>
  )
}
export default TopBar

const styles = StyleSheet.create({
  title: {
    fontFamily: 'VictorMono',
    alignSelf: 'center',
    color: 'white',
    alignContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    backgroundColor: 'black',
  },
  backButton: {
    position: 'absolute',
    backgroundColor: '#947100',
  },
})
