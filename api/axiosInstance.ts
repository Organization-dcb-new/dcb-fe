import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'

// Buat instance axios dengan konfigurasi default
const apiClient = axios.create({
  baseURL: 'https://new-payment.redision.com:4000/api', // Ganti dengan URL API Anda
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
