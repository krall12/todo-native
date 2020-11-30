import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const AuthContext = React.createContext<any>({})

export default function AuthProvider({ children }: any) {
  const [state, dispatch] = React.useReducer(
    (prevState: any, action: any) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          }
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            user: action.user,
          }
        case 'SIGN_OUT':
          AsyncStorage.removeItem('userToken')
          AsyncStorage.removeItem('user')
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            user: null,
          }
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  )

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken
      let user

      try {
        userToken = await AsyncStorage.getItem('userToken')
        user = await AsyncStorage.getItem('user')
        console.log({ user })

        // This will switch to the App screen or Auth screen and this loading
        // screen will be unmounted and thrown away.
        dispatch({
          type: 'RESTORE_TOKEN',
          token: userToken,
          user: user && user.length ? JSON.parse(user) : null,
        })
      } catch (e) {
        // Restoring token failed
        dispatch({ type: 'SIGN_OUT' })
      }
    }

    bootstrapAsync()
  }, [])

  const authContext = React.useMemo(
    () => ({
      user: state.user,
      userToken: state.userToken,
      signIn: async (data: any) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token
        try {
          const result = await fetch('http://localhost:3001/api/login', {
            method: 'POST',
            body: JSON.stringify({ email: data.email, password: data.password }),
            headers: { 'Content-Type': 'application/json' },
          })

          const res = await result.json()
          dispatch({ type: 'SIGN_IN', token: res.token, user: res.user })
        } catch (error) {
          console.log(error)
        }
      },
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
    }),
    [state]
  )

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
}
