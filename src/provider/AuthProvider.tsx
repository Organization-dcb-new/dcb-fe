import axios from 'axios'
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'

const API_DEV = 'http://localhost:4000/api'
const API_PROD = 'http://localhost:4000/api'
//const API_PROD = 'https://new-payment.redision.com/api'

interface AuthContextType {
  token: string | null
  setToken: (newToken: string | null) => void
  role: string | null
  appKey: string | null
  appId: string | null
  apiUrl: string
  isDev: boolean
  toggleApi: () => void
  setIsDev: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken_] = useState<string | null>(localStorage.getItem('token'))
  const [role, setRole] = useState<string | null>(null)
  const [appKey, setAppKey] = useState<string | null>(null)
  const [appId, setAppId] = useState<string | null>(null)

  // State untuk API environment
  const [isDev, setIsDev] = useState(localStorage.getItem('api_env') !== 'prod')
  const apiUrl = isDev ? API_DEV : API_PROD

  const toggleApi = () => {
    setIsDev((prev) => {
      const newIsDev = !prev
      localStorage.setItem('api_env', newIsDev ? 'dev' : 'prod')

      // Reload halaman agar perubahan environment langsung diterapkan
      window.location.reload()
      return newIsDev
    })
  }

  const setToken = (newToken: string | null) => {
    setToken_(newToken)
    if (newToken) {
      const decoded: any = jwtDecode(newToken)
      setRole(decoded.role)

      if (isDev) {
        setAppId(decoded.dev_app_id)
        setAppKey(decoded.deva_pp_key)
      } else {
        setAppId(decoded.app_id)
        setAppKey(decoded.app_key)
      }

      localStorage.setItem('token', newToken)
    }
  }

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
      localStorage.setItem('token', token)

      const decoded: any = jwtDecode(token)
      const isExpired = decoded.exp * 1000 < Date.now()

      if (isExpired || !decoded) {
        setToken(null)
        localStorage.removeItem('token')
        window.location.href = '/login'
      } else {
        setRole(decoded.role)

        if (isDev) {
          setAppId(decoded.dev_app_id)
          setAppKey(decoded.dev_app_key)
        } else {
          setAppId(decoded.app_id)
          setAppKey(decoded.app_key)
        }
      }
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
    }
  }, [token, isDev])

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      role,
      appKey,
      appId,
      apiUrl,
      isDev,
      toggleApi,
      setIsDev,
    }),
    [token, role, isDev],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
