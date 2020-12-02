import { View, Text, Card, CardItem, Body, Content, Container } from 'native-base'
import * as React from 'react'
import { useQuery } from 'react-query'

export default function TodoSingleScreen({ navigation, route }) {
  const { data, status } = useQuery(['tood', route.params.todoId], () =>
    fetch(`http://192.168.1.172:3001/api/todo/${route.params.todoId}`, {
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json())
  )

  const todo = data?.[0]

  if (status === 'loading') {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    )
  }

  if (status === 'error') {
    return (
      <View>
        <Text>Could not load todo</Text>
      </View>
    )
  }

  return (
    <Content padder>
      <Card>
        <View padder>
          <Text style={{ opacity: 0.8, fontSize: 13 }}>Title</Text>
          <Text style={{ fontSize: 18 }}>{todo.title}</Text>
        </View>
        <View padder>
          <Text style={{ opacity: 0.8, fontSize: 13 }}>Description</Text>
          <Text style={{ fontSize: 14, marginTop: 4 }}>{todo.description}</Text>
        </View>
        <View padder>
          <Text style={{ opacity: 0.8, fontSize: 13 }}>Audio Message</Text>

          {todo.audioUrl && <Text style={{ fontSize: 14, marginTop: 4 }}>{todo.audioUrl}</Text>}
        </View>
      </Card>

      <View padder>
        <Text>{JSON.stringify(todo, null, 2)}</Text>
      </View>
    </Content>
  )
}
