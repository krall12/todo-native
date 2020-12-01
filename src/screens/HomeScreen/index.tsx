import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Button, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import TodoViewScreen from './TodoViewScreen'
import TodoCreateScreen from './TodoCreateScreen'

const HomeStack = createStackNavigator()

export default function HomeScreen({ navigation }: any) {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="TodoView"
        component={TodoViewScreen}
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate('TodoCreate')} style={{ marginRight: 20 }}>
              <Ionicons name="ios-add" size={34} color="blue" />
            </TouchableOpacity>
          ),
        }}
      />

      <HomeStack.Screen
        name="TodoCreate"
        component={TodoCreateScreen}
        options={{
          headerTitle: 'Create',
          // headerRight: () => (
          //   <TouchableOpacity onPress={openCreateSheet} style={{ marginRight: 20 }}>
          //     <Ionicons name="ios-add" size={34} color="blue" />
          //   </TouchableOpacity>
          // ),
        }}
      />
    </HomeStack.Navigator>
  )
}
