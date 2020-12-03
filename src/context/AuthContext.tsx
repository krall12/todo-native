import React, { useState, useEffect, useMemo } from 'react'
import { Text } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useQuery } from 'react-query'

export const AuthContext = React.createContext<any>({})

export default function AuthProvider({ children }: any) {
  const [state, setState] = useState({
    isSignedIn: false,
    userToken: null,
    user: null,
  })

  const { data: userSettings } = useQuery(
    'user-settings',
    () =>
      fetch('http://192.168.1.172:3001/api/user-settings/' + state?.user?.id, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }).then((res) => res.json()),
    {
      enabled: state?.user?.id,
    }
  )

  const restoreToken = (token: string, user: any) => {
    setState({ isSignedIn: true, userToken: token, user: JSON.parse(user) })
  }

  const signIn = async (data: { email: string; password: string }) => {
    const result = await fetch('http://192.168.1.172:3001/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: data.email, password: data.password }),
      headers: { 'Content-Type': 'application/json' },
    }).then((res) => res.json())

    if (result.token) {
      setState({ isSignedIn: true, userToken: result.token, user: result.user })
      AsyncStorage.setItem('userToken', result.token)
      AsyncStorage.setItem('user', JSON.stringify(result.user))
    }
  }

  const signOut = () => {
    setState({ isSignedIn: false, userToken: null, user: null })
    AsyncStorage.removeItem('userToken')
    AsyncStorage.removeItem('user')
  }

  const authContext = useMemo(
    () => ({
      user: state.user,
      userToken: state.userToken,
      userSettings,
      signIn,
      signOut,
    }),
    [state, signIn, signOut]
  )

  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    ;(async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken')
        const user = await AsyncStorage.getItem('user')
        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        restoreToken(userToken, user)
      } catch (e) {
        // Restoring token failed
        signOut()
      }
    })()
  }, [])

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
}
