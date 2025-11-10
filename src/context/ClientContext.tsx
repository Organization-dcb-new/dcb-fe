// src/context/ClientContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../provider/AuthProvider'

export interface PaymentMethod {
  id: number
  name: string
  route: {
    [key: string]: any[]
  }
  flexible: boolean
  status: number
  msisdn: number
  client_id: string
}

export interface Settlement {
  id: number
  client_id: string
  name: string
  [key: string]: any
}

export interface App {
  id: number
  app_name: string
  appid: string
  appkey: string
  callback_url: string
  testing: number
  status: number
  mobile: string
  fail_callback: string
  client_id: string
  created_at: string
  updated_at: string
}

export interface RouteWeight {
  id: number
  client_id: string
  payment_method: string
  route: string
  weight: number
  created_at: string
  updated_at: string
}

export interface Client {
  u_id: string
  client_name: string
  client_appkey: string
  client_secret: string
  client_appid: string
  app_name: string
  mobile: string
  client_status: number
  phone: string
  email: string
  address?: string
  testing: number
  lang: string
  callback_url: string
  fail_callback: string
  isdcb: string
  updated_at: string
  created_at: string
  payment_methods: PaymentMethod[]
  settlements: Settlement[] | null
  apps: App[]
  route_weights: RouteWeight[]
}

interface ClientContextType {
  client: Client | null
  loading: boolean
  error: string | null
  refetch: () => void
}

const ClientContext = createContext<ClientContextType>({
  client: null,
  loading: false,
  error: null,
  refetch: () => {},
})

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token, apiUrl, appId, appKey } = useAuth()

  const fetchClientDetail = async () => {
    // if (!appId || !appKey) {
    //   setError('App ID or App Key not available')
    //   return
    // }
    const tokenNew =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjI4MzE2NjksInJvbGUiOiJzdXBlcmFkbWluIiwidXNlcl9pZCI6MjksInVzZXJuYW1lIjoidmlhbjEyMzQifQ.yDUqFOOPbhq64eKl-1yMvkuMse8SEBKMZDXk6e7PcFo'

    setLoading(true)
    setError(null)

    try {
      const response = await axios.get(`${apiUrl}/admin/merchant/EMH-NgRnHSZ2cmyo0s2jXA`, {
        headers: {
          Authorization: `Bearer ${tokenNew}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data.success) {
        setClient(response.data.data)
      } else {
        setError('Failed to fetch client data')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch client data')
      console.error('Error fetching client detail:', err)
    } finally {
      setLoading(false)
    }
  }

  const refetch = () => {
    fetchClientDetail()
  }

  useEffect(() => {
    // if (token && appId && appKey) {
    //   fetchClientDetail()
    // }
    if (token) {
      fetchClientDetail()
    }
  }, [token])
  // [token, appId, appKey])

  return <ClientContext.Provider value={{ client, loading, error, refetch }}>{children}</ClientContext.Provider>
}

export const useClient = () => useContext(ClientContext)
