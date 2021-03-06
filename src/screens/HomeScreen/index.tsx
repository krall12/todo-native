import React, { useContext } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import TodoViewScreen from './TodoViewScreen'
import TodoCreateScreen from './TodoCreateScreen'
import TodoSingleScreen from './TodoSingleScreen'
import { AuthContext } from '../../context/AuthContext'

const HomeStack = createStackNavigator()

export default function HomeScreen({ navigation }: any) {
  const authContext = useContext(AuthContext)

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: authContext.userSettings?.accentColor },
      }}
    >
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
        name="TodoSingle"
        component={TodoSingleScreen}
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('TodoSingleEdit')}
              style={{ marginRight: 20 }}
            >
              <Ionicons name="md-create" size={24} color="blue" />
            </TouchableOpacity>
          ),
        }}
      />

      <HomeStack.Screen name="TodoCreate" component={TodoCreateScreen} />
    </HomeStack.Navigator>
  )
}
