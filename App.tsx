import * as React from 'react'
import RootNavigation from './src/components/RootNavigation'
import { setConsole, QueryCache, ReactQueryCacheProvider } from 'react-query'
import AuthContextProvider from './src/context/AuthContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'

setConsole({
  log: console.log,
  warn: console.warn,
  error: console.warn,
})

const queryCache = new QueryCache()

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <ReactQueryCacheProvider queryCache={queryCache}>
          <RootNavigation />
        </ReactQueryCacheProvider>
      </AuthContextProvider>
    </SafeAreaProvider>
  )
}
