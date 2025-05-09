import { styled } from '@mui/material/styles'
// import Avatar from '@mui/material/Avatar'
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import MenuContent from './MenuContent'
import { Navigate } from 'react-router-dom'
// import CardAlert from './CardAlert'
import OptionsMenu from './OptionsMenu'
// import IconButton from '@mui/material/IconButton'
// import { ChevronLeft, MenuOpen } from '@mui/icons-material'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../provider/AuthProvider'
import { UserOutlined } from '@ant-design/icons'
import { Avatar } from 'antd'

const drawerWidth = 240

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
})

interface SideMenuProps {
  open: boolean
  handleDrawerToggle: () => void
}

export default function SideMenu({ open }: SideMenuProps) {
  const { token } = useAuth()
  if (!token || typeof token !== 'string') {
    // window.location.href = '/login' // Ganti dengan rute yang sesuai
    return <Navigate to='/login' /> // Menghentikan eksekusi komponen
  }

  const decoded: any = jwtDecode(token as string)
  return (
    <Box>
      {/* <IconButton
        className="bg-amber-200"
        onClick={handleDrawerToggle}
        sx={{ m: 1 }}
      >
        {open ? <ChevronLeft /> : <MenuOpen />}
      </IconButton> */}
      <Drawer
        variant='persistent'
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
          [`& .${drawerClasses.paper}`]: {
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            mt: 'calc(var(--template-frame-height, 0px) + 4px)',
            p: 1.5,
          }}
          className='pt-[32px]'
        >
          {/* <SelectContent /> */}
          <div className='text-3xl mx-auto'>Redpay Panel</div>
        </Box>
        <Divider />
        <MenuContent />
        {/* <CardAlert /> */}
        <Stack
          direction='row'
          sx={{
            p: 2,
            gap: 1,
            alignItems: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* <Avatar sizes='small' alt='Riley Carter' src='/static/images/avatar/7.jpg' sx={{ width: 36, height: 36 }} /> */}
          <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
          <Box sx={{ mr: 'auto' }}>
            <Typography variant='body2' sx={{ fontWeight: 500, lineHeight: '16px' }}>
              {decoded.username}
            </Typography>
          </Box>
          <OptionsMenu />
        </Stack>
      </Drawer>
    </Box>
  )
}
