import { StyleSheet, Text, View } from 'react-native'
import { IncomingTram } from '../clients/tfgmAPI'

type TramProperty = {
  tram: IncomingTram
}

const TramDetailsBox = ({ tram }: TramProperty) => {
  let waitText: string
  if (tram.status === 'Due') {
    waitText = 'Due in ' + tram.wait + ' minutes'
  } else {
    waitText = tram.status
  }
  return (
    <View style={styles.item}>
      <Text style={styles.title}>{tram.dest}</Text>
      <Text>{waitText}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#ffec44',
    padding: 20,
    marginVertical: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
  },
})

export default TramDetailsBox
