import axios from 'axios'
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'

// Definisikan tipe untuk konteks
interface AuthContextType {
  token: string | null
  setToken: (newToken: string | null) => void
  role: string | null
  appKey: string | null
  appId: string | null
}

// Berikan nilai default untuk konteks
const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AuthProvider = ({ children }: { children: ReactNode }) => {
  // State to hold the authentication token
  const [token, setToken_] = useState<string | null>(localStorage.getItem('token'))
  const [role, setRole] = useState<string | null>(null) // State untuk role
  const [appKey, setAppKey] = useState<string | null>(null) // State untuk role
  const [appId, setAppId] = useState<string | null>(null) // State untuk role

  // Function to set the authentication token
  const setToken = (newToken: string | null) => {
    setToken_(newToken)
    if (newToken) {
      const decoded: any = jwtDecode(newToken)
      setRole(decoded.role)
      setAppId(decoded.appid)
      setAppKey(decoded.appkey)
    }
  }

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
      localStorage.setItem('token', token)

      const decoded: any = jwtDecode(token)
      const isExpired = decoded.exp * 1000 < Date.now()
      console.log('decoded: ', decoded)

      if (isExpired) {
        setToken(null)
        localStorage.removeItem('token')
        window.location.href = '/login'
      } else {
        setRole(decoded.role)
        setAppId(decoded.appid)
        setAppKey(decoded.appkey)
      }
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }, [token])

  // Memoized value of the authentication context
  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      role,
      appKey,
      appId,
    }),
    [token, role], // Tambahkan role ke dependensi
  )

  // Provide the authentication context to the children components
  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
