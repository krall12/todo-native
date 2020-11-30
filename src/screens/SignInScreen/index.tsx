import React from 'react'
import { View, TextInput, Button } from 'react-native'
import { AuthContext } from '../../context/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignInScreen() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const { signIn, userToken } = React.useContext(AuthContext)

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Sign in" onPress={() => signIn({ email, password })} />
      </View>
    </SafeAreaView>
  )
}
