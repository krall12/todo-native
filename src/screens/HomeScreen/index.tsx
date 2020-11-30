import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import TodoScreen from './Todos'

const HomeStack = createStackNavigator()

export default function HomeScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Todos" component={TodoScreen} />
    </HomeStack.Navigator>
  )
}
