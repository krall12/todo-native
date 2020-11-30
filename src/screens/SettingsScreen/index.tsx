import React from 'react'
import { View, Text, Button } from 'react-native'
import { AuthContext } from '../../context/AuthContext'

export default function SettingsScreen() {
  const auth = React.useContext(AuthContext)

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings!</Text>

      <Button title="Sign out" onPress={() => auth.signOut()} />
    </View>
  )
}
