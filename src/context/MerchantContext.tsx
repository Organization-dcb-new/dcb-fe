// src/context/MerchantContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../provider/AuthProvider'

export interface PaymentMethod {
  id: number
  name: string
  client_id: string
  [key: string]: any
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
  [key: string]: any
}

export interface Merchant {
  u_id: string
  client_name: string
  app_name: string
  email: string
  phone: string
  payment_methods: PaymentMethod[]
  settlements: Settlement[]
  apps: App[]
  [key: string]: any
}

interface MerchantContextType {
  merchants: Merchant[]
  loading: boolean
  error: string | null
}

const MerchantContext = createContext<MerchantContextType>({
  merchants: [],
  loading: false,
  error: null,
})

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token, apiUrl } = useAuth()

  useEffect(() => {
    const fetchMerchants = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${apiUrl}/admin/merchants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setMerchants(response.data.data)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch merchants')
      } finally {
        setLoading(false)
      }
    }

    fetchMerchants()
  }, [])

  return <MerchantContext.Provider value={{ merchants, loading, error }}>{children}</MerchantContext.Provider>
}

export const useMerchants = () => useContext(MerchantContext)
