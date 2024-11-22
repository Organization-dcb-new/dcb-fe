import SideMenu from '../components/SideMenu'
import Box from '@mui/material/Box'

export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <SideMenu />
      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  )
}
