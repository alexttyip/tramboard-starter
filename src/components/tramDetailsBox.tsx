import { StyleSheet, Text, View } from 'react-native'
import { IncomingTram } from '../clients/tfgmAPI'

type TramProperty = {
  tram: IncomingTram
}

const TramDetailsBox = ({ tram }: TramProperty) => {
  let waitText: string
  if (tram.status === 'Due') {
    waitText = 'Due in ' + tram.wait + ' minute'
    if (tram.wait !== '1') {
      waitText += 's'
    }
  } else {
    waitText = tram.status
  }

  let carriageText: string
  if (tram.carriages === 'Single') {
    carriageText = '2'
  } else {
    carriageText = '4'
  }

  return (
    <View style={styles.item}>
      <Text style={styles.title}>{tram.dest}</Text>
      <Text style={styles.waitText}>{waitText}</Text>
      <Text style={styles.waitText}>{carriageText} carriages</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#ffec44',
    borderColor: '#000000',
    borderWidth: 2,
    overflow: 'hidden',
    padding: 20,
    marginVertical: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
  },
  waitText: {
    fontSize: 16,
  },
})

export default TramDetailsBox
