import React from 'react'
import { View, Text } from 'react-native'
import { AuthContext } from '../../context/AuthContext'
import { useQuery } from 'react-query'

export default function HomeScreen() {
  const context = React.useContext(AuthContext)

  // const { data: todos } = useQuery(['todos'], () =>
  //   fetch('http://localhost:3001/api/todos', {
  //     method: 'GET',
  //   }).then((res) => res.json())
  // )

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!!</Text>

      <Text>{JSON.stringify(context, null, 2)}</Text>
    </View>
  )
}
