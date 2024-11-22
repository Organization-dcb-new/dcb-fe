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
  //   padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    // duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      // duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
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
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            // duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
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
