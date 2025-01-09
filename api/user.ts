import { get, post, put, del } from './axiosInstance'

// Fungsi untuk login
export const Login = async (email: string, password: string) => {
  return await post('/user/Login', { email, password })
}

// Fungsi untuk mendapatkan profil pengguna
export const getUserProfile = async () => {
  return await get('/user/profile')
}

// Fungsi untuk memperbarui profil pengguna
export const updateUserProfile = async (data: any) => {
  return await put('/user/profile', data)
}

// Fungsi untuk menghapus pengguna
export const deleteUser = async (userId: string) => {
  return await del(`/user/${userId}`)
}
