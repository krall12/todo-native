import React, { useState } from 'react'
import { Button, Text } from 'react-native'
import { View, Card } from 'native-base'
import { AuthContext } from '../../context/AuthContext'
import { ColorPicker, fromHsv, toHsv } from 'react-native-color-picker'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SettingsScreen() {
  const auth = React.useContext(AuthContext)
  const [color, setColor] = useState(toHsv(auth.user?.accentColor))

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Card style={{ flex: 1 }}>
        <View padder style={{ flex: 1 }}>
          <ColorPicker
            defaultColor={toHsv(auth.user?.accentColor)}
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
        <Button title="Sign out" onPress={() => auth.signOut()} />
      </View>
    </SafeAreaView>
  )
}
