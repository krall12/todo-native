import React from 'react'
import { View, Text } from 'react-native'
import { useQuery } from 'react-query'

const fetchUsers = async () => {
  const res = await fetch('http://localhost:3001/users')
  return await res.json()
}

export default function HomeScreen() {
  const { data: users, status } = useQuery(['users'], fetchUsers)

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home!</Text>

      {status === 'loading' ? <Text>Loading...</Text> : <Text>{JSON.stringify(users, null, 2)}</Text>}
    </View>
  )
}
