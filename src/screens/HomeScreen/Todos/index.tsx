import React from 'react'
import { Text, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { AuthContext } from '../../../context/AuthContext'
import { useQuery } from 'react-query'

export default function HomeScreen() {
  const context = React.useContext(AuthContext)
  const [refreshing, setRefreshing] = React.useState(false)

  const { data: todos, status, refetch } = useQuery(['todos'], () =>
    fetch('http://192.168.1.172:3001/api/todos/' + context.user.id, {
      method: 'GET',
    }).then((res) => res.json())
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setRefreshing(false)
  }

  if (status === 'loading') {
    return <ActivityIndicator />
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={todos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={{ backgroundColor: 'rgba(255, 0 ,0, .4)' }}>
            <Text>{item.title}</Text>
          </View>
        )}
      />
    </View>
  )
}
