import Home from '../pages/Home'
import Login from '../pages/Login'
import { createBrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import MainLayout from '../layout/MainLayout'
import Transactions from '../pages/Transactions'
import Summary from '../pages/Summary'
import PrivateRoute from '../components/PrivateRoute'
// import { useParams } from 'react-router-dom'
import TransactionDetail from '../pages/TransactionDetail'
import TransactionsMerchant from '../pages/TransactionsMerchant'
import TransactionMerchantDetail from '../pages/TransactionsMerchantDetail'

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
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: 'transactions',
        element: (
          <PrivateRoute allowedRoles={['admin', 'superadmin']}>
            <Transactions />
          </PrivateRoute>
        ),
      },
      {
        path: 'transaction/:id',
        element: (
          <PrivateRoute allowedRoles={['admin', 'superadmin']}>
            <TransactionDetail />
          </PrivateRoute>
        ),
      },
      {
        path: 'merchant-transactions',
        element: (
          <PrivateRoute allowedRoles={['merchant']}>
            <TransactionsMerchant />
          </PrivateRoute>
        ),
      },
      {
        path: 'merchant-transaction/:id',
        element: (
          <PrivateRoute allowedRoles={['merchant']}>
            <TransactionMerchantDetail />
          </PrivateRoute>
        ),
      },
      {
        path: 'summary/:type',
        element: (
          <PrivateRoute>
            <Summary />
          </PrivateRoute>
        ),
        children: [
          {
            path: 'summary/hourly',
            element: (
              <PrivateRoute>
                <Summary />
              </PrivateRoute>
            ),
          },
          {
            path: 'summary/daily',
            element: (
              <PrivateRoute>
                <Summary />
              </PrivateRoute>
            ),
          },
          {
            path: 'summary/monthly',
            element: <Summary />,
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
