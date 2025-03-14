import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { styled, useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import AppBar from '@mui/material/AppBar'
import SideMenu from '../components/SideMenu'
import MenuIcon from '@mui/icons-material/Menu'
import AppTheme from '../styles/theme/shared-theme/AppTheme'
import ApiSwitcher from '../components/ApiSwitcher'

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from '../styles/theme/customizations'

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
}

const drawerWidth = 240

const MainContent = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})<{
  open: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
  }),
  marginLeft: open ? 0 : `-${drawerWidth}px`,
  width: open ? `calc(100% - ${drawerWidth}px)` : '100%', // Menyesuaikan lebar konten
}))

export default function MainLayout() {
  const theme = useTheme()
  const [open, setOpen] = useState(true)

  const handleDrawerToggle = () => {
    setOpen(!open)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position='fixed'
        className='flex flex-row items-center justify-between pr-4'
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
          }),
          marginLeft: open ? `${drawerWidth}px` : 0, // Geser AppBar saat sidebar terbuka
          width: open ? `calc(100% - ${drawerWidth}px)` : '100%', // Atur lebar AppBar
        }}
      >
        <div>
          <Toolbar>
            <IconButton
              color='inherit'
              aria-label='open drawer'
              edge='start'
              onClick={handleDrawerToggle}
              sx={{ marginRight: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </div>
        <ApiSwitcher />
      </AppBar>

      <SideMenu open={open} handleDrawerToggle={handleDrawerToggle} />

      <AppTheme themeComponents={xThemeComponents}>
        <MainContent open={open}>
          <Toolbar />
          <Outlet />
        </MainContent>
      </AppTheme>
    </Box>
  )
}
