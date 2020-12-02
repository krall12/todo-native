import React, { useState, useContext } from 'react'
import { Text, Button, TouchableHighlight, PlatformColor } from 'react-native'
import { Card, Content, Item, Form, Label, Input, View } from 'native-base'
import { Audio } from 'expo-av'
import * as Permissions from 'expo-permissions'
import * as FileSystem from 'expo-file-system'
import { Machine, assign } from 'xstate'
import { useMachine } from '@xstate/react'
import { AuthContext } from '../../context/AuthContext'
import { useQueryCache } from 'react-query'

export default function CreateTodo({ navigation }: any) {
  const queryCache = useQueryCache()
  const [fields, setFields] = useState({ title: '', description: '' })
  const authContext = useContext(AuthContext)

  const [{ context, value, matches }, send] = useMachine(audioMachine, {
    context: {
      // @ts-ignore
      sound: new Audio.Sound(),
      recording: new Audio.Recording(),
      audioUrl: null,
      checkRecordPermission: async () => {
        const permission = await Permissions.askAsync(Permissions.AUDIO_RECORDING)

        if (permission.status !== 'granted') {
          throw 'Does not have microphone access'
        }
      },
      startRecording: async (recording: any, sound: any) => {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        })

        if (sound !== null) {
          console.log('stop whatever sound is playing')
        }

        await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY)
        // recording.setOnRecordingStatusUpdate((status: any) => console.log(status))
        recording.setOnRecordingStatusUpdate()
        await recording.startAsync()
      },
      stopRecording: async (recording: any) => {
        await recording.stopAndUnloadAsync()
        const info = await FileSystem.getInfoAsync(recording.getURI() || '')

        return info
      },
      deleteRecording: async (audioUrl: any) => {
        await FileSystem.deleteAsync(audioUrl)
      },
      playRecording: async (recording: any) => {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        })

        const { sound: recordingSound, status } = await recording.createNewLoadedSoundAsync({})
        await recordingSound.playAsync()
        console.log(status)
      },
    },
    actions: {
      assignRecording: assign({
        audioUrl: (_, { data }: any) => data.uri,
      }),
      deleteRecording: assign({
        audioUrl: null,
        recording: () => new Audio.Recording(),
      }),
    },
  })

  const saveTodo = async () => {
    if (fields.title.length === 0) {
      return
    }

    await fetch('http://192.168.1.172:3001/api/todos', {
      method: 'POST',
      body: JSON.stringify({
        userId: authContext.user.id,
        title: fields.title,
        description: fields.description,
        audioUrl: context.audioUrl,
      }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json())

    await queryCache.refetchQueries(['todos'])
    navigation.navigate('TodoView')
  }

  return (
    <Content padder>
      <Card>
        <Form>
          <Item stackedLabel>
            <Label>Title</Label>
            <Input onChangeText={(value) => setFields((s) => ({ ...s, title: value }))} />
          </Item>
          <Item stackedLabel last>
            <Label>Description</Label>
            <Input onChangeText={(value) => setFields((s) => ({ ...s, description: value }))} />
          </Item>
        </Form>
      </Card>
      <Card>
        <View padder>
          <Text style={{ textAlign: 'center', fontWeight: '500', fontSize: 18 }}>Audio Message</Text>
        </View>

        {matches('no_permission') && (
          <Text style={{ padding: 10 }}>
            We do not have permission to record on your device. Head to the settings and update your
            preference on microphone usage.
          </Text>
        )}

        {matches('has_permission') && (
          <View padder>
            {matches('has_permission.idle') && (
              <Text style={{ textAlign: 'center' }}>
                <Button title="Record" onPress={() => send('RECORD')} />
              </Text>
            )}

            {matches('has_permission.starting_record') && <Text>starting_record</Text>}

            {matches('has_permission.recording') && (
              <Text style={{ textAlign: 'center' }}>
                Recording...
                <Button title="Stop" onPress={() => send('STOP')} />
              </Text>
            )}

            {matches('has_permission.stopping_record') && <Text>stopping_record</Text>}

            {matches('has_permission.has_recording') && (
              <Text style={{ textAlign: 'center' }}>
                <Button title="Play" onPress={() => send('PLAY')} />
                <Button title="Delete Recording" onPress={() => send('DELETE')} />
              </Text>
            )}

            {matches('has_permission.deleting') && <Text>deleting</Text>}

            {matches('has_permission.playing') && <Text>Playing...</Text>}
          </View>
        )}
      </Card>

      <TouchableHighlight
        onPress={saveTodo}
        style={{ backgroundColor: PlatformColor('systemBlue'), padding: 10, marginTop: 10, borderRadius: 4 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Save Todo</Text>
      </TouchableHighlight>

      <Text>{JSON.stringify(fields, null, 2)}</Text>
      <Text>{JSON.stringify(context.audioUrl, null, 2)}</Text>
      <Text>{JSON.stringify(value, null, 2)}</Text>
    </Content>
  )
}

const audioMachine = Machine({
  id: 'audio-machine',
  initial: 'checking_permission',
  states: {
    checking_permission: {
      id: 'check-permission',
      invoke: {
        src: async ({ checkRecordPermission }) => checkRecordPermission(),
        onDone: 'has_permission',
        onError: 'no_permission',
      },
    },

    no_permission: {
      type: 'final',
    },

    has_permission: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            RECORD: 'starting_record',
          },
        },

        starting_record: {
          id: 'starting-record',
          invoke: {
            src: async ({ startRecording, recording, sound }) => startRecording(recording, sound),
            onDone: 'recording',
            onError: {
              actions: [(_, error) => console.log(error)],
            },
          },
        },

        recording: {
          on: {
            STOP: 'stopping_record',
          },
        },

        stopping_record: {
          invoke: {
            src: async ({ stopRecording, recording, sound }) => stopRecording(recording, sound),
            onDone: {
              actions: 'assignRecording',
              target: 'has_recording',
            },
            onError: {
              actions: [(_, error) => console.log(error)],
            },
          },
        },

        has_recording: {
          on: {
            PLAY: 'playing',
            DELETE: 'deleting',
          },
        },

        deleting: {
          invoke: {
            src: async ({ audioUrl, deleteRecording }) => deleteRecording(audioUrl),
            onDone: {
              target: 'idle',
              actions: 'deleteRecording',
            },
            onError: {
              actions: [(_, error) => console.log(error)],
            },
          },
        },

        playing: {
          invoke: {
            src: async ({ playRecording, recording }) => playRecording(recording),
            onDone: 'has_recording',
            onError: {
              target: 'has_recording',
              actions: [(_, error) => console.log(error)],
            },
          },
        },
      },
    },
  },
})
