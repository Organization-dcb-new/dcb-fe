import * as React from 'react'
import { useEffect } from 'react'

import { useLocation } from 'react-router-dom'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'

import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import MuiCard from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import axios from 'axios'
import { useAuth } from '../provider/AuthProvider'
import AppTheme from '../styles/theme/shared-theme/AppTheme'

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow: 'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow: 'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}))

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage: 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}))

export default function Login(props: { disableCustomTheme?: boolean }) {
  const [emailError] = React.useState(false)
  const [emailErrorMessage] = React.useState('')
  const [passwordError, setPasswordError] = React.useState(false)
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const { setToken, apiUrl, setIsDev } = useAuth()

  const location = useLocation()

  // Jika berada di halaman login, set mode ke Production
  useEffect(() => {
    if (location.pathname === '/login') {
      setIsDev(false)
      localStorage.setItem('api_env', 'prod')
    }
  }, [location.pathname, setIsDev])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault() // Mencegah reload halaman
    if (!validateInputs()) return // Validasi input

    const data = new FormData(event.currentTarget)
    const username = data.get('username')
    const password = data.get('password')

    try {
      setLoading(true)

      const userData = {
        username,
        password,
      }

      const response = await axios.post(`${apiUrl}/user/login`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // console.log('response', response)
      // Simpan token ke localStorage
      console.log('response', response.data)
      setToken(response.data.token)
      // Ganti dengan respons yang sesuai
      // Redirect atau lakukan tindakan lain setelah login berhasil
      window.location.href = '/' // Ganti dengan rute yang sesuai
    } catch (error: unknown) {
      console.error('Login failed:', error)
      // Tangani error, misalnya menampilkan pesan kesalahan
      if (axios.isAxiosError(error)) {
        // Memeriksa apakah error memiliki response
        if (error.response) {
          alert(error.response.data.message || 'Login failed. Please try again.')
        } else {
          alert('Login failed. No response from server.')
        }
      } else {
        alert('Login failed. Please check your network connection.')
      }
    } finally {
      setLoading(false) // Reset loading state
    }
  }

  const validateInputs = () => {
    // const username = document.getElementById('username') as HTMLInputElement
    const password = document.getElementById('password') as HTMLInputElement

    let isValid = true

    // if (!username.value || !/\S+@\S+\.\S+/.test(username.value)) {
    //   setEmailError(true)
    //   setEmailErrorMessage('Please enter a valid email address.')
    //   isValid = false
    // } else {
    //   setEmailError(false)
    //   setEmailErrorMessage('')
    // }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true)
      setPasswordErrorMessage('Password must be at least 6 characters long.')
      isValid = false
    } else {
      setPasswordError(false)
      setPasswordErrorMessage('')
    }

    return isValid
  }

  return (
    <AppTheme {...props}>
      <SignInContainer direction='column' justifyContent='space-between'>
        <Card variant='outlined'>
          <Typography component='h1' variant='h3' sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}>
            Sign in
          </Typography>
          <Box
            component='form'
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor='username'>Username</FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id='username'
                type='username'
                name='username'
                placeholder='your username'
                autoComplete='email'
                autoFocus
                required
                fullWidth
                variant='outlined'
                color={emailError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <FormLabel htmlFor='password'>Password</FormLabel>
              </Box>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name='password'
                placeholder='••••••'
                type='password'
                id='password'
                autoComplete='current-password'
                required
                fullWidth
                variant='outlined'
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>

            <Button
              type='submit'
              fullWidth
              variant='contained'
              color='secondary'
              className='mt-4'
              disabled={loading} // Disable button saat loading
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  )
}
