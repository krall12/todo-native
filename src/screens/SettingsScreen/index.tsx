import React, { useState } from 'react'
import { Button, Text } from 'react-native'
import { View, Card } from 'native-base'
import { AuthContext } from '../../context/AuthContext'
import { ColorPicker, fromHsv, toHsv } from 'react-native-color-picker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQueryCache } from 'react-query'

export default function SettingsScreen() {
  const auth = React.useContext(AuthContext)
  const queryCache = useQueryCache()
  const [color, setColor] = useState(toHsv(auth.userSettings?.accentColor))

  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const setAccentColor = async () => {
    await fetch('http://192.168.1.172:3001/api/user-settings/' + auth.user.id, {
      method: 'PATCH',
      body: JSON.stringify({ accentColor: fromHsv(color) }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json())

    await queryCache.refetchQueries('user-settings')
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Card style={{ flex: 1 }}>
        <View padder style={{ flex: 1 }}>
          <ColorPicker
            defaultColor={toHsv(auth.userSettings?.accentColor)}
            onColorChange={(color) => setColor(color)}
            style={{ flex: 1 }}
          />
        </View>
        <View padder>
          <Text style={{ textAlign: 'center', color: fromHsv(color), fontSize: 18 }}>
            {fromHsv(color) || 'nothing'}
          </Text>
        </View>
      </Card>
      <View style={{ flex: 1 }}>
        {fromHsv(color) !== auth.userSettings?.accentColor && (
          <Button
            title={state === 'idle' ? 'Update App Accent Color' : 'Loading...'}
            onPress={setAccentColor}
          />
        )}
        <Button title="Sign out" onPress={() => auth.signOut()} />
      </View>
    </SafeAreaView>
  )
}
