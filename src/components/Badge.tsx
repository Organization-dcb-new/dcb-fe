// Badge.tsx
import React from 'react'

export interface BadgeProps {
  text: string
  color: 'success' | 'error' | 'pending' | 'waiting-callback' // Anda dapat menambahkan lebih banyak warna jika diperlukan
}

const Badge: React.FC<BadgeProps> = ({ text, color }) => {
  let backgroundColor
  let textColor = 'white' // Warna teks default

  switch (color) {
    case 'success':
      backgroundColor = '#4CAF50' // Hijau
      break
    case 'error':
      backgroundColor = '#F44336' // Merah
      break
    case 'pending':
      backgroundColor = '#FFC107' // Kuning
      break
    case 'waiting-callback':
      backgroundColor = '#945af2' // Kuning
      break
    default:
      backgroundColor = '#9E9E9E' // Abu-abu untuk status tidak dikenal
      textColor = 'black' // Ubah warna teks untuk abu-abu
  }

  return (
    <span
      style={{
        backgroundColor,
        color: textColor,
        padding: 'auto 10px',
        width: '80px',
        height: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-block',
      }}
    >
      {text}
    </span>
  )
}

export default Badge
