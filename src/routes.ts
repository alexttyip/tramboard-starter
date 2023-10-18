import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

export type ScreenNavigationProps<T extends keyof RootStackParamList> = {
  navigation: StackNavigationProp<RootStackParamList, T>
  route: RouteProp<RootStackParamList, T>
}

export type RootStackParamList = {
  Home: undefined
  Details: undefined
  Times: undefined
}
