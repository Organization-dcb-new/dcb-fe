import Home from '../pages/Home'
import Login from '../pages/Login'
import { createBrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import MainLayout from '../layout/MainLayout'
import Transactions from '../pages/Transactions'
import Summary from '../pages/Summary'
import { useParams } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'transactions',
        element: <Transactions />,
      },
      {
        path: 'summary/:type',
        element: <Summary />,
        children: [
          {
            path: 'summary/hourly',
            element: <Summary />,
          },
          {
            path: 'summary/daily',
            element: <Summary />,
          },
          {
            path: 'summary/monthly',
            element: <Summary type='Monthly' />,
          },
        ],
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
])

export default router
