import { ReactNode, useState } from 'react'
import SideMenu from '../components/SideMenu'
import Box from '@mui/material/Box'

interface LayoutProps {
  children: ReactNode // Tentukan tipe untuk children
}

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false)

  const handleDrawerToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu open={open} handleDrawerToggle={handleDrawerToggle} />
      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  )
}
