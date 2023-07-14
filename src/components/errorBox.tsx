import { Text, StyleSheet } from 'react-native'

type ErrorMsg = {
  msg: string | undefined
}
const ErrorBox = ({ msg }: ErrorMsg) => {
  if (msg) {
    return <Text style={styles.error}>{msg}</Text>
  }
  return <></>
}

const styles = StyleSheet.create({
  error: {
    backgroundColor: '#ffcccc',
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
    margin: 5,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#000000',
    overflow: 'hidden',
  },
})
export default ErrorBox
