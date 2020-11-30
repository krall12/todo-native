import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import HomeScreen from '../screens/HomeScreen'
import SettingsScreen from '../screens/SettingsScreen'

const Tab = createBottomTabNavigator()

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="ios-list" size={size} color={color} />,
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="ios-cog" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
