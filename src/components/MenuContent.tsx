import { useState } from 'react'
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Divider, Collapse } from '@mui/material'

import { Link } from 'react-router-dom'

import {
  HomeRounded as HomeIcon,
  AnalyticsRounded as AnalyticsIcon,
  ListAltOutlined,
  AssignmentRounded as AssignmentIcon,
  SettingsRounded as SettingsIcon,
  StoreMallDirectoryOutlined,
  BusinessOutlined,
  Inbox as InboxIcon,
  ReceiptLongOutlined,
  ListOutlined,
  ExpandLess,
  ExpandMore,
  StarBorder,
} from '@mui/icons-material'

const mainListItems = [
  // { text: "Home", icon: <HomeIcon />, path: "/" },
  { text: 'Dashboard', icon: <AnalyticsIcon />, path: '/' },
  {
    text: 'Transaction Data',
    icon: <ReceiptLongOutlined />,
    nestedItems: [
      {
        text: 'Redpay Transaction',
        icon: <ReceiptLongOutlined />,
        path: '/transactions',
      },
    ],
  },
  {
    text: 'Summary',
    icon: <ListAltOutlined />,
    path: '/transactions',
    nestedItems: [
      { text: 'Report Hourly', icon: <ListOutlined />, path: '/summary/hourly' },
      { text: 'Report Daily', icon: <ListOutlined />, path: '/summary/daily' },
      { text: 'Report Monthly', icon: <ListOutlined />, path: '/summary/monthly' },
    ],
  },
]

const secondaryListItems = [
  {
    text: 'Redpay',
    icon: <BusinessOutlined />,
    nestedItems: [{ text: 'Merchant', icon: <StoreMallDirectoryOutlined /> }],
  },
]

export default function MenuContent() {
  const [openItems, setOpenItems] = useState({})

  const handleToggle = (index) => {
    setOpenItems((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }))
  }

  return (
    <Stack sx={{ p: 1, flexGrow: 1 }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <div>
            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
              <div
                key={index}
                className='min-w-0 '
                sx={{ pl: 6 }}
                onClick={() => item.nestedItems && handleToggle(index)}
              >
                <Link to={item.path}>
                  <ListItemButton>
                    {item.icon && <ListItemIcon className='min-w-8'>{item.icon}</ListItemIcon>}
                    <ListItemText disableTypography className='!text-base' primary={item.text} />
                    {item.nestedItems ? openItems[index] ? <ExpandLess /> : <ExpandMore /> : null}
                  </ListItemButton>
                </Link>
              </div>
            </ListItem>
            {item.nestedItems && (
              <Collapse in={openItems[index]} timeout='auto' unmountOnExit>
                <List component='div' disablePadding>
                  {item.nestedItems.map((nestedItem, nestedIndex) => (
                    // <ListItemButton key={nestedIndex} className='min-w-0 px-6 ' sx={{ pl: 6 }}>
                    <Link to={nestedItem.path}>
                      <div key={nestedIndex} className='min-w-0 flex pl-6' sx={{ pl: 6 }}>
                        <ListItemIcon className='min-w-8'>{nestedItem.icon}</ListItemIcon>
                        <ListItemText className='text-sm' disableTypography primary={nestedItem.text} />
                      </div>
                    </Link>
                  ))}
                </List>
              </Collapse>
            )}
          </div>
        ))}
      </List>

      <div className='mt-10 '>
        <div className='text-xl mb-2'>Internal</div>
        <Divider />

        <List dense>
          {secondaryListItems.map((item, index) => (
            <div>
              <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                <ListItemButton onClick={() => item.nestedItems && handleToggle(index)}>
                  {item.icon && <ListItemIcon className='min-w-8'>{item.icon}</ListItemIcon>}
                  <ListItemText disableTypography className='!text-base' primary={item.text} />
                  {item.nestedItems ? openItems[index] ? <ExpandLess /> : <ExpandMore /> : null}
                </ListItemButton>
              </ListItem>
              {item.nestedItems && (
                <Collapse in={openItems[index]} timeout='auto' unmountOnExit>
                  <List component='div' disablePadding>
                    {item.nestedItems.map((nestedItem, nestedIndex) => (
                      <ListItemButton key={nestedIndex} className='min-w-0  ' sx={{ pl: 6 }}>
                        <ListItemIcon className='min-w-8'>{nestedItem.icon}</ListItemIcon>
                        <ListItemText className='text-sm' disableTypography primary={nestedItem.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </div>
          ))}
        </List>
      </div>
    </Stack>
  )
}
