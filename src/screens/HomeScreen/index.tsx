import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Button, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import TodoScreen from './Todos'

const HomeStack = createStackNavigator()

export default function HomeScreen() {
  const openCreateSheet = () => console.log('hi')

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Todos"
        component={TodoScreen}
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={openCreateSheet} style={{ marginRight: 20 }}>
              <Ionicons name="ios-add" size={34} color="blue" />
            </TouchableOpacity>
          ),
        }}
      />
    </HomeStack.Navigator>
  )
}
