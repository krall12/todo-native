import React, { useState, useEffect } from 'react'
import { Text, Button, TouchableHighlight, PlatformColor } from 'react-native'
import { Card, Content, Item, Form, Label, Input, View } from 'native-base'
import { Audio } from 'expo-av'
import * as Permissions from 'expo-permissions'
import * as FileSystem from 'expo-file-system'
import { Machine, assign } from 'xstate'
import { useMachine } from '@xstate/react'

export default function CreateTodo() {
  const [fields, setFields] = useState({ title: '', description: '' })

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
      playRecording: async (recording: any, sound: any) => {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        })

        const { sound: recordingSound } = await recording.createNewLoadedSoundAsync({})
        await recordingSound.playAsync()
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
    gurads: {},
  })

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

            {matches('has_permission.playing') && <Text>playing</Text>}
          </View>
        )}
      </Card>

      <TouchableHighlight
        onPress={console.log}
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
            src: async ({ playRecording, recording, sound }) => playRecording(recording, sound),
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

// const audioMachine = Machine({
//   id: 'audio-machine',
//   initial: 'checking_permission',
//   states: {
//     checking_permission: {
//       invoke: {
//         src: async ({ checkRecordPermission }) => checkRecordPermission(),
//         onDone: 'idle',
//         onError: 'permission_denied',
//       },
//     },
//     permission_denied: {
//       type: 'final',
//     },
//     idle: {
//       on: {
//         RECORD: 'start_record',
//       },
//     },
//     start_record: {
//       invoke: {
//         src: async ({ startRecording, recording, sound }) => startRecording(recording, sound),
//         onDone: 'record_done',
//         onError: { actions: (_, { data }) => console.log(data) },
//       },
//     },
//     record_done: {
//       invoke: {
//         src: async ({ stopRecording, recording, sound }) => stopRecording(recording, sound),
//         onDone: 'done',
//         onError: { actions: (_, { data }) => console.log(data) },
//       },
//       // on: {
//       //   DELETE: 'idle',
//       //   LOAD_RECORDING: 'loading_recording',
//       // },
//     },
//     done: {},
//     loading_recording: {
//       on: {
//         LOADED: 'playing',
//       },
//     },
//     playing: {
//       on: {
//         PLAY_FINISH: 'record_done',
//         STOP: 'record_done',
//       },
//     },
//   },
// })

// export default function CreateTodo() {
//   const [state, setState] = useState({
//     hasRecordingPermission: false,
//     hasLoadedRecording: false,
//     hasActiveRecording: false,
//     isRecording: false,
//     isPlaying: false,
//     title: '',
//     description: '',
//     audioUrl: '',
//   })

//   useEffect(() => {
//     // ask for permission to use the microphone to record audio when this
//     // component mounts.
//     ;(async () => {
//       const permission = await Permissions.askAsync(Permissions.AUDIO_RECORDING)
//       if (permission.status === 'granted') {
//         setState((current) => ({ ...current, hasRecordingPermission: true }))
//       }
//     })()
//   }, [])

//   // if they can fire this method, we know they already have recording access.
//   const record = async () => {
//     // only one instance can be used at any given time. if we use it, we have to
//     // reset the instance to a new instance
//     if (audioRecording === null) {
//       audioRecording = new Audio.Recording()
//     }

//     // because this button is used for both recording, and stop recording, we
//     // account for both states.
//     if (state.isRecording) {
//       try {
//         await audioRecording.stopAndUnloadAsync()
//         const info = await FileSystem.getInfoAsync(audioRecording.getURI() || '')
//         setState((s) => ({ ...s, isRecording: false, hasActiveRecording: true, audioUrl: info.uri }))

//         // @ts-ignore
//         audioRecording = null
//       } catch (error) {
//         console.log(error)
//       }
//       return
//     }

//     try {
//       setState((s) => ({ ...s, isRecording: true }))
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
//         playsInSilentModeIOS: true,
//         shouldDuckAndroid: true,
//         interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
//         playThroughEarpieceAndroid: false,
//         staysActiveInBackground: true,
//       })

//       if (audioSound !== null) {
//         console.log('stop whatever sound is playing')
//       }

//       await audioRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY)
//       audioRecording.setOnRecordingStatusUpdate((status) => console.log(status))
//       await audioRecording.startAsync()
//     } catch (error) {
//       // An error occurred!
//       console.log(error)
//     }
//   }

//   const playBackAudio = async () => {
//     console.log('starting...')
//     try {
//       if (!audioSound._loaded) {
//         await audioSound.loadAsync({ uri: state.audioUrl })
//         setState((s) => ({ ...s, hasLoadedRecording: true }))
//       }

//       setState((s) => ({ ...s, isPlaying: true }))
//       await audioSound.playAsync()
//       setState((s) => ({ ...s, isPlaying: false }))
//     } catch (error) {
//       setState((s) => ({ ...s, isPlaying: false }))
//       console.log('error...')
//       console.log(error)
//     }
//   }

//   return (
//     <Content padder>
//       <Card>
//         <Form>
//           <Item stackedLabel>
//             <Label>Title</Label>
//             <Input onChangeText={(value) => setState((s) => ({ ...s, title: value }))} />
//           </Item>
//           <Item stackedLabel last>
//             <Label>Description</Label>
//             <Input onChangeText={(value) => setState((s) => ({ ...s, description: value }))} />
//           </Item>
//         </Form>
//       </Card>
//       <Card>
//         <View padder>
//           <Text style={{ textAlign: 'center', fontWeight: '500', fontSize: 18 }}>Audio Message</Text>
//         </View>

//         {!state.hasRecordingPermission ? (
//           <Text style={{ padding: 10 }}>
//             We do not have permission to record on your device. Head to the settings and update your
//             preference on microphone usage.
//           </Text>
//         ) : state.audioUrl ? (
//           <View padder>
//             <Text style={{ textAlign: 'center' }}>Audio message recorded.</Text>

//             <Button title={state.isPlaying ? 'Playing...' : 'Play back'} onPress={playBackAudio} />
//           </View>
//         ) : (
//           <View padder>
//             <Button title={state.isRecording ? 'Done' : 'Record'} onPress={record} />
//           </View>
//         )}
//       </Card>

//       <TouchableHighlight
//         onPress={console.log}
//         style={{ backgroundColor: PlatformColor('systemBlue'), padding: 10, marginTop: 10, borderRadius: 4 }}
//       >
//         <Text style={{ color: '#fff', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Save Todo</Text>
//       </TouchableHighlight>

//       <Text>{JSON.stringify(state, null, 2)}</Text>
//     </Content>
//   )
// }
