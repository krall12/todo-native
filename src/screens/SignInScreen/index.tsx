import React from 'react'
import { View, TextInput, Button } from 'react-native'
import { AuthContext } from '../../context/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignInScreen() {
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')

  const { signIn } = React.useContext(AuthContext)

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View>
        <TextInput placeholder="Username" value={username} onChangeText={setUsername} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Sign in" onPress={() => signIn({ username, password })} />
      </View>
    </SafeAreaView>
  )
}
