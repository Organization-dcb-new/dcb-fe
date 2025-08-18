import React from 'react'
import { useClient } from '../context/ClientContext'
import { Card, CardContent, Typography, Skeleton, Chip } from '@mui/material'

const ClientInfo: React.FC = () => {
  const { client, loading, error } = useClient()

  if (loading) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Skeleton variant='text' width='60%' height={32} />
          <Skeleton variant='text' width='40%' height={24} />
          <Skeleton variant='text' width='80%' height={20} />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Typography color='error' variant='body2'>
            Error: {error}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  if (!client) {
    return (
      <Card variant='outlined'>
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            No client data available
          </Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant='outlined'>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          {client.client_name}
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          {client.email}
        </Typography>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Phone: {client.phone}
        </Typography>

        <div style={{ marginTop: 16 }}>
          <Typography variant='subtitle2' gutterBottom>
            Payment Methods:
          </Typography>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {client.payment_methods.map((method) => (
              <Chip
                key={method.id}
                label={method.name}
                size='small'
                color={method.status === 1 ? 'success' : 'default'}
                variant={method.status === 1 ? 'filled' : 'outlined'}
              />
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Typography variant='subtitle2' gutterBottom>
            Apps ({client.apps.length}):
          </Typography>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {client.apps.slice(0, 5).map((app) => (
              <Chip
                key={app.id}
                label={app.app_name}
                size='small'
                color={app.status === 1 ? 'primary' : 'default'}
                variant={app.status === 1 ? 'filled' : 'outlined'}
              />
            ))}
            {client.apps.length > 5 && (
              <Chip label={`+${client.apps.length - 5} more`} size='small' variant='outlined' />
            )}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Typography variant='body2' color='text.secondary'>
            Status: {client.client_status === 1 ? 'Active' : 'Inactive'}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Testing: {client.testing === 1 ? 'Yes' : 'No'}
          </Typography>
        </div>
      </CardContent>
    </Card>
  )
}

export default ClientInfo
