import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import HomeScreen from '../screens/HomeScreen'
import SettingsScreen from '../screens/SettingsScreen'
import { routes } from '../config'

const Tab = createBottomTabNavigator()

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator>
        <Tab.Screen
          name={routes.home}
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="ios-list" size={size} color={color} />,
          }}
        />

        <Tab.Screen
          name={routes.settings}
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Ionicons name="ios-cog" size={size} color={color} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
