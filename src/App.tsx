// import Home from './pages/Home'
// import Login from './pages/Login'
// import { Route, Routes } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import AuthProvider from './provider/AuthProvider'
// import SideMenu from './components/SideMenu'
// import Dashboard from './pages/Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <div className=''>
      {/* <SideMenu />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes> */}
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AuthProvider>
    </div>
  )
}

export default App
