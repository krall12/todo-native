import * as React from 'react'
import RootNavigation from './src/components/RootNavigation'
import { setConsole, QueryCache, ReactQueryCacheProvider } from 'react-query'

setConsole({
  log: console.log,
  warn: console.warn,
  error: console.warn,
})

const queryCache = new QueryCache()

export default function App() {
  return (
    <ReactQueryCacheProvider queryCache={queryCache}>
      <RootNavigation />
    </ReactQueryCacheProvider>
  )
}
