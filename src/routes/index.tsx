import Login from '../pages/Login'
import { createBrowserRouter } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import DashboardMerchant from '../pages/DashboardMerchant'
import MainLayout from '../layout/MainLayout'
import Transactions from '../pages/Transactions'
import Summary from '../pages/Summary'
import PrivateRoute from '../components/PrivateRoute'
import { MerchantProvider } from '../context/MerchantContext'
import { ClientProvider } from '../context/ClientContext'

import TransactionDetail from '../pages/TransactionDetail'
import TransactionsMerchant from '../pages/TransactionsMerchant'
import TransactionMerchantDetail from '../pages/TransactionsMerchantDetail'
import Merchant from '../pages/Merchant'
import DetailMerchant from '../pages/Merchant/[id]'
import SummaryAdmin from '../pages/SummaryAdmin'
import Report from '../pages/Report'
import SummaryDaily from '../pages/SummaryDaily'
import ReportMargin from '../pages/ReportMargin'
import MerchantProfile from '../pages/MerchantProfile'
import TransactionSimulationPage from '../pages/TransactionSimulation'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: 'merchant-dashboard',
        element: (
          <PrivateRoute>
            <DashboardMerchant />
          </PrivateRoute>
        ),
      },
      {
        path: 'transactions',
        element: (
          <PrivateRoute allowedRoles={['admin', 'superadmin', 'business']}>
            <MerchantProvider>
              <Transactions />
            </MerchantProvider>
          </PrivateRoute>
        ),
      },
      {
        path: 'transaction/:id',
        element: (
          <PrivateRoute allowedRoles={['admin', 'superadmin', 'business']}>
            <TransactionDetail />
          </PrivateRoute>
        ),
      },
      {
        path: 'merchant',
        element: (
          <PrivateRoute allowedRoles={['admin', 'superadmin', 'business']}>
            <Merchant />
          </PrivateRoute>
        ),
      },
      {
        path: 'merchant/:id',
        element: (
          <PrivateRoute allowedRoles={['admin', 'superadmin', 'business']}>
            <DetailMerchant />
          </PrivateRoute>
        ),
      },
      {
        path: 'merchant-transactions',
        element: (
          <PrivateRoute allowedRoles={['merchant']}>
            <ClientProvider>
              <TransactionsMerchant />
            </ClientProvider>
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
        path: 'transaction-simulation',
        element: (
          <PrivateRoute allowedRoles={['merchant']}>
            <ClientProvider>
              <TransactionSimulationPage />
            </ClientProvider>
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
        path: 'merchant-profile',
        element: (
          <PrivateRoute allowedRoles={['merchant', 'superadmin', 'business']}>
            <ClientProvider>
              <MerchantProfile />
            </ClientProvider>
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
              <PrivateRoute allowedRoles={['admin', 'superadmin', 'business']}>
                <Summary />
              </PrivateRoute>
            ),
          },
          {
            path: 'summary/daily',
            element: (
              <PrivateRoute allowedRoles={['admin', 'superadmin', 'business']}>
                <MerchantProvider>
                  <SummaryDaily />
                </MerchantProvider>
              </PrivateRoute>
            ),
          },
          {
            path: 'summary/monthly',
            element: <Summary />,
          },
        ],
      },
      {
        path: 'admin/summary',
        element: (
          <PrivateRoute allowedRoles={['admin', 'superadmin', 'merchant']}>
            <SummaryAdmin />
          </PrivateRoute>
        ),
      },
      {
        path: 'report',
        element: (
          <PrivateRoute allowedRoles={['admin', 'superadmin', 'business']}>
            <MerchantProvider>
              <Report />
            </MerchantProvider>
          </PrivateRoute>
        ),
      },
      {
        path: 'report-margin',
        element: (
          <PrivateRoute allowedRoles={['business']}>
            <ReportMargin />
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
