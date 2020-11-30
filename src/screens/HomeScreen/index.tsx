import React from 'react'
import { View, Text } from 'react-native'
import { AuthContext } from '../../context/AuthContext'

export default function HomeScreen() {
  const { user } = React.useContext(AuthContext)

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!!</Text>

      <Text>{JSON.stringify(user, null, 2)}</Text>
    </View>
  )
}
