import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../provider/AuthProvider'

interface AppResponse {
  status: string
  message: string
  data: {
    app_secret: string
    app_key: string
    app_id: string
    payment_method: string[]
  }
}

const fetchApp = async (apiUrl: string, token: string): Promise<AppResponse> => {
  const res = await fetch(`${apiUrl}/get-app`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch app data: ${res.statusText}`)
  }

  return res.json()
}

export const useGetApp = () => {
  const { token, apiUrl } = useAuth()

  return useQuery({
    queryKey: ['get-app', token],
    queryFn: () => fetchApp(apiUrl ?? '', token ?? ''),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  })
}
