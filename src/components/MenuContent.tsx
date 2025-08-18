import { useState } from 'react'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Divider,
  Collapse,
  Typography,
  Box,
} from '@mui/material'

import { Link, useLocation } from 'react-router-dom'

import {
  // HomeRounded as HomeIcon,
  AnalyticsRounded as AnalyticsIcon,
  ListAltOutlined,
  // AssignmentRounded as AssignmentIcon,
  // SettingsRounded as SettingsIcon,
  StoreMallDirectoryOutlined,
  BusinessOutlined,
  // Inbox as InboxIcon,
  ReceiptLongOutlined,
  ExpandLess,
  ExpandMore,
  BarChartOutlined,
  // StarBorder,
} from '@mui/icons-material'

import { useAuth } from '../provider/AuthProvider'
import { jwtDecode } from 'jwt-decode'

export default function MenuContent() {
  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({})
  const location = useLocation()

  const { token } = useAuth()
  const decoded: any = jwtDecode(token as string)

  const handleToggle = (index: any) => {
    setOpenItems((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }))
  }

  const secondaryListItems = [
    {
      text: 'Redpay',
      icon: <BusinessOutlined />,
      path: '/merchant',
      nestedItems: [
        { text: 'Merchant', icon: <StoreMallDirectoryOutlined />, path: '/merchant' },
        { text: 'Summary', icon: <BarChartOutlined />, path: '/admin/summary' },
      ],
    },
  ]

  const mainListItems = [
    ...(decoded.role !== 'merchant' ? [{ text: 'Dashboard', icon: <AnalyticsIcon />, path: '/' }] : []),
    {
      text: 'Transaction Data',
      icon: <ReceiptLongOutlined />,
      nestedItems: [
        {
          text: 'Redpay Transaction',
          icon: <ReceiptLongOutlined />,
          path: decoded.role != 'merchant' ? '/transactions' : 'merchant-transactions',
        },
      ],
    },
    // {
    //   text: 'Report Transactions',
    //   icon: <ListAltOutlined />,
    //   path: '/report-transactions',
    // },
    ...(decoded.role !== 'merchant' ? [{ text: 'Summary', icon: <ListAltOutlined />, path: '/summary/daily' }] : []),
    // {
    //   text: 'Summary',
    //   icon: <ListAltOutlined />,
    //   nestedItems: [
    //     { text: 'Daily', icon: <ListOutlined />, path: '/summary/daily' },
    //     // { text: 'Monthly', icon: <ListOutlined />, path: '/summary/monthly' },
    //   ],
    // },
    ...(decoded.role !== 'merchant' ? [{ text: 'Report', icon: <ListAltOutlined />, path: '/report' }] : []),
    // {
    //   text: 'Report',
    //   icon: <ListAltOutlined />,
    //   path: '/report',
    // },
  ]

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  const isParentActive = (item: any) => {
    if (item.path && isActiveRoute(item.path)) return true
    if (item.nestedItems) {
      return item.nestedItems.some((nested: any) => isActiveRoute(nested.path))
    }
    return false
  }

  return (
    <Stack sx={{ p: 2, flexGrow: 1, paddingBottom: '80px' }}>
      <Typography
        variant='overline'
        sx={{
          fontWeight: 600,
          color: 'text.secondary',
          letterSpacing: '0.5px',
          mb: 1,
          px: 1,
        }}
      >
        Main Menu
      </Typography>
      <List dense sx={{ mb: 2 }}>
        {mainListItems.map((item, index) => (
          <Box key={index} sx={{ mb: 0.5 }}>
            <ListItem disablePadding>
              {item.nestedItems ? (
                <ListItemButton
                  onClick={() => handleToggle(index)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    px: 2,
                    py: 1,
                    backgroundColor: isParentActive(item) ? 'action.selected' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isParentActive(item) ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '14px',
                      fontWeight: isParentActive(item) ? 600 : 500,
                      color: isParentActive(item) ? 'primary.main' : 'text.primary',
                    }}
                  />
                  {openItems[index] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
              ) : (
                <Link to={item.path as string} style={{ textDecoration: 'none', width: '100%' }}>
                  <ListItemButton
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      px: 2,
                      py: 1,
                      backgroundColor: isActiveRoute(item.path as string) ? 'action.selected' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isActiveRoute(item.path as string) ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '14px',
                        fontWeight: isActiveRoute(item.path as string) ? 600 : 500,
                        color: isActiveRoute(item.path as string) ? 'primary.main' : 'text.primary',
                      }}
                    />
                  </ListItemButton>
                </Link>
              )}
            </ListItem>
            {item.nestedItems && (
              <Collapse in={openItems[index]} timeout='auto' unmountOnExit>
                <List component='div' disablePadding sx={{ ml: 1 }}>
                  {item.nestedItems.map((nestedItem, nestedIndex) => (
                    <ListItem key={nestedIndex} disablePadding>
                      <Link to={nestedItem.path} style={{ textDecoration: 'none', width: '100%' }}>
                        <ListItemButton
                          sx={{
                            borderRadius: 2,
                            mx: 1,
                            px: 2,
                            py: 0.75,
                            pl: 6,
                            backgroundColor: isActiveRoute(nestedItem.path) ? 'action.selected' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 32,
                              color: isActiveRoute(nestedItem.path) ? 'primary.main' : 'text.secondary',
                            }}
                          >
                            {nestedItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={nestedItem.text}
                            primaryTypographyProps={{
                              fontSize: '13px',
                              fontWeight: isActiveRoute(nestedItem.path) ? 600 : 400,
                              color: isActiveRoute(nestedItem.path) ? 'primary.main' : 'text.primary',
                            }}
                          />
                        </ListItemButton>
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>

      {decoded.role != 'merchant' && (
        <Box sx={{ mt: 2 }}>
          <Typography
            variant='overline'
            sx={{
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '0.5px',
              mb: 1,
              px: 1,
            }}
          >
            Internal Tools
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <List dense>
            {secondaryListItems.map((item, index) => (
              <Box key={index} sx={{ mb: 0.5 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => item.nestedItems && handleToggle(index + 100)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      px: 2,
                      py: 1,
                      backgroundColor: isParentActive(item) ? 'action.selected' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{ minWidth: 40, color: isParentActive(item) ? 'primary.main' : 'text.secondary' }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '14px',
                        fontWeight: isParentActive(item) ? 600 : 500,
                        color: isParentActive(item) ? 'primary.main' : 'text.primary',
                      }}
                    />
                    {item.nestedItems && (openItems[index + 100] ? <ExpandLess /> : <ExpandMore />)}
                  </ListItemButton>
                </ListItem>
                {item.nestedItems && (
                  <Collapse in={openItems[index + 100]} timeout='auto' unmountOnExit>
                    <List component='div' disablePadding sx={{ ml: 1 }}>
                      {item.nestedItems.map((nestedItem, nestedIndex) => (
                        <ListItem key={nestedIndex} disablePadding>
                          <Link to={nestedItem.path} style={{ textDecoration: 'none', width: '100%' }}>
                            <ListItemButton
                              sx={{
                                borderRadius: 2,
                                mx: 1,
                                px: 2,
                                py: 0.75,
                                pl: 6,
                                backgroundColor: isActiveRoute(nestedItem.path) ? 'action.selected' : 'transparent',
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{
                                  minWidth: 32,
                                  color: isActiveRoute(nestedItem.path) ? 'primary.main' : 'text.secondary',
                                }}
                              >
                                {nestedItem.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={nestedItem.text}
                                primaryTypographyProps={{
                                  fontSize: '13px',
                                  fontWeight: isActiveRoute(nestedItem.path) ? 600 : 400,
                                  color: isActiveRoute(nestedItem.path) ? 'primary.main' : 'text.primary',
                                }}
                              />
                            </ListItemButton>
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            ))}
          </List>
        </Box>
      )}
    </Stack>
  )
}
