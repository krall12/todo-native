import React from 'react'
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import { AuthContext } from '../../../context/AuthContext'
import { useQuery } from 'react-query'
import { List, ListItem, Left, Right, Text, Body, Icon, CheckBox } from 'native-base'

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
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        data={todos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <List>
            <ListItem avatar onPress={console.log}>
              <CheckBox checked={!!item.isComplete} />
              <Body>
                <Text>{item.title}</Text>
                <Text note>{item.description}</Text>
              </Body>
              <Right style={{ alignSelf: 'center' }}>
                <Icon name="arrow-forward" />
              </Right>
            </ListItem>
          </List>
        )}
      />
    </View>
  )
}
