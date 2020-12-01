import React from 'react'
import { Text, Button } from 'react-native'
import { Card, Content, Item, Form, Label, Input, View } from 'native-base'
import { Audio } from 'expo-av'
import * as Permissions from 'expo-permissions'
import * as FileSystem from 'expo-file-system'

let audioRecording = new Audio.Recording()
const audioSound = new Audio.Sound()

const audioReducer = (state: any, action: any) => {
  switch (action.type) {
    case 'START_RECORDING_STOP_PLAYBACK':
      return { ...state, isRecording: true, isLoading: true }
    case 'STOP_RECORDING':
      return { ...state, isRecording: false, isLoading: false }
    default:
      throw new Error(`Unhandled action type: ${action.type}`)
  }
}

export default function CreateTodo() {
  const [state, dispatch] = React.useReducer(
    audioReducer,
    {
      isRecording: false,
      isLoading: true,
    },
    () => ({
      // check initially if the app has user permission to record audio. if this
      // is the first open, they will be asked to grant access.
      hasRecordingPermission: Permissions.askAsync(Permissions.AUDIO_RECORDING).then(
        (res) => res.status === 'granted'
      ),
    })
  )

  // if they can fire this method, we know they already have recording access.
  const record = async () => {
    // only one instance can be used at any given time. if we use it, we have to
    // reset the instance to a new instance
    if (audioRecording === null) {
      audioRecording = new Audio.Recording()
    }

    // because this button is used for both recording, and stop recording, we
    // account for both states.
    if (state.isRecording) {
      try {
        dispatch({ type: 'STOP_RECORDING' })
        await audioRecording.stopAndUnloadAsync()
        const info = await FileSystem.getInfoAsync(audioRecording.getURI() || '')
        console.log(`FILE INFO: ${JSON.stringify(info)}`)

        // @ts-ignore
        audioRecording = null
      } catch (error) {
        console.log(error)
      }
      return
    }

    try {
      dispatch({ type: 'START_RECORDING_STOP_PLAYBACK' })
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      })

      if (audioSound !== null) {
        console.log('stop whatever sound is playing')
      }

      await audioRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_LOW_QUALITY)
      audioRecording.setOnRecordingStatusUpdate((status) => console.log(status))
      await audioRecording.startAsync()
    } catch (error) {
      // An error occurred!
      console.log(error)
    }
  }

  return (
    <Content padder>
      <Card>
        <Form>
          <Item stackedLabel>
            <Label>Title</Label>
            <Input />
          </Item>
          <Item stackedLabel last>
            <Label>Description</Label>
            <Input />
          </Item>
        </Form>
      </Card>
      <Card>
        <View padder>
          <Text style={{ textAlign: 'center', fontWeight: '500', fontSize: 18 }}>Audio Message</Text>
        </View>

        {!state.hasRecordingPermission ? (
          <Text style={{ padding: 10 }}>
            We do not have permission to record on your device. Head to the settings and update your
            preference on microphone usage.
          </Text>
        ) : (
          <View padder>
            <Button title={state.isRecording ? 'Done' : 'Record'} onPress={record} />
          </View>
        )}
      </Card>
    </Content>
  )
}
