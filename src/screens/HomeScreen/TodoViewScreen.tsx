import React from 'react'
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { AuthContext } from '../../context/AuthContext'
import { useQuery, useQueryCache } from 'react-query'
import { List, ListItem, Right, Text, Body, Icon, CheckBox } from 'native-base'

export default function TodoViewScreen() {
  const queryCache = useQueryCache()
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

  const handleToggleComplete = async (todo: any) => {
    try {
      await fetch('http://192.168.1.172:3001/api/todos/' + todo.id, {
        method: 'PATCH',
        body: JSON.stringify({ ...todo, isComplete: !todo.isComplete }),
        headers: { 'Content-Type': 'application/json' },
      })

      await queryCache.refetchQueries(['todos'])
    } catch (error) {
      console.log(error)
    }
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
          <List style={{ backgroundColor: '#fff' }}>
            <ListItem avatar>
              <CheckBox checked={!!item.isComplete} onPress={() => handleToggleComplete(item)} />
              <Body>
                <Text>{item.title}</Text>
                {item.description && <Text note>{item.description}</Text>}
              </Body>
              <Right>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Icon name="arrow-forward" />
                </View>
              </Right>
            </ListItem>
          </List>
        )}
      />
    </View>
  )
}
