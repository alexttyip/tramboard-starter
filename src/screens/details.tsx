import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from 'react-native-paper'
import LocationInfo from '../components/positionInfo'

const DetailsScreen = () => (
  <View style={styles.container}>
    <Text>Details Screen</Text>
    <LocationInfo />
  </View>
)

export default DetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
