import * as React from 'react'
import RootNavigation from './src/components/RootNavigation'
import { setConsole, QueryCache, ReactQueryCacheProvider } from 'react-query'
import AuthContextProvider from './src/context/AuthContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Container } from 'native-base'
import * as Font from 'expo-font'
import { Ionicons } from '@expo/vector-icons'

setConsole({
  log: console.log,
  warn: console.warn,
  error: console.warn,
})

const queryCache = new QueryCache()

export default function App() {
  React.useLayoutEffect(() => {
    ;(async () =>
      await Font.loadAsync({
        Roboto: require('native-base/Fonts/Roboto.ttf'),
        Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
        ...Ionicons.font,
      }))()
  }, [])

  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <ReactQueryCacheProvider queryCache={queryCache}>
          <Container>
            <RootNavigation />
          </Container>
        </ReactQueryCacheProvider>
      </AuthContextProvider>
    </SafeAreaProvider>
  )
}
