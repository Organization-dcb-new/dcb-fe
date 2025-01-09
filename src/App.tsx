import Home from './pages/Home'
import Login from './pages/Login'
import { Route, Routes } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import AuthProvider from './provider/AuthProvider'
import SideMenu from './components/SideMenu'
import Dashboard from './pages/Dashboard'

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
        <RouterProvider router={router} />
      </AuthProvider>
    </div>
  )
}

export default App
