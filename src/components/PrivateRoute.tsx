import { Navigate } from 'react-router-dom'
import { useAuth } from '../provider/AuthProvider'
import { ReactNode } from 'react'

interface PrivateRouteProps {
  children: ReactNode
  allowedRoles?: string[] | null // Tambahkan properti untuk allowedRoles
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const { token, role } = useAuth()
  const isAuthenticated = !!token // Cek apakah pengguna terautentikasi
  const hasAccess = allowedRoles ? allowedRoles.includes(role as string) : true // Cek apakah role ada dalam allowedRoles
  console.log('hasAccess: ', hasAccess)
  console.log('role: ', role)
  console.log('allowed: ', allowedRoles)

  return isAuthenticated ? children : <Navigate to='/login' />
}

export default PrivateRoute
