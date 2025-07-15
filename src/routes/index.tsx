import Home from '../pages/Home'
import Login from '../pages/Login'
import { createBrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import MainLayout from '../layout/MainLayout'
import Transactions from '../pages/Transactions'
import Summary from '../pages/Summary'
import PrivateRoute from '../components/PrivateRoute'

import TransactionDetail from '../pages/TransactionDetail'
import TransactionsMerchant from '../pages/TransactionsMerchant'
import TransactionMerchantDetail from '../pages/TransactionsMerchantDetail'
import Report from '../pages/Report'
// import SummaryDaily from '../pages/SummaryDaily'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
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
      // {
      //   path: 'report-transactions',
      //   element: (
      //     <PrivateRoute allowedRoles={['admin', 'superadmin']}>
      //       <ReportTransactions />
      //     </PrivateRoute>
      //   ),
      // },
      {
        path: 'merchant-transaction/:id',
        element: (
          <PrivateRoute allowedRoles={['merchant']}>
            <TransactionMerchantDetail />
          </PrivateRoute>
        ),
      },
      {
        // path: 'summary/:type',
        // element: (
        //   <PrivateRoute>
        //     <Summary />
        //   </PrivateRoute>
        // ),
        children: [
          {
            path: 'summary/hourly',
            element: (
              <PrivateRoute>
                <Summary />
              </PrivateRoute>
            ),
          },
          // {
          //   path: 'summary/daily',
          //   element: (
          //     <PrivateRoute>
          //       <SummaryDaily />
          //     </PrivateRoute>
          //   ),
          // },
          {
            path: 'summary/monthly',
            element: <Summary />,
          },
        ],
      },
      {
        path: 'report',
        element: (
          <PrivateRoute allowedRoles={['admin', 'superadmin']}>
            <Report />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
])

export default router
