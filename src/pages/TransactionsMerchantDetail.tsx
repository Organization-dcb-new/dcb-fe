// TransactionDetail.tsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from '@mui/material/Button'
import axios from 'axios'
import dayjs from 'dayjs'
import { Typography, Card, CircularProgress, Box } from '@mui/material'
import { useAuth } from '../provider/AuthProvider'
import { useNavigate } from 'react-router-dom'
import formatRupiah from '../utils/FormatRupiah'
import { message } from 'antd'
import { highlightJSON } from '../utils/TransactionUtils'

interface Transaction {
  u_id: string
  user_mdn: string
  payment_method: string
  timestamp_callback_date: number
  currency: string
  app_name: string
  user_id: string
  status_code: number
  fail_reason: string
  created_at: string
  timestamp_callback_result: string
  merchant_transaction_id: string
  updated_at: number
  amount: number
  item_name: number
  testing: boolean
  price: number
  timestamp_request_date: Date
}

const TransactionMerchantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [resendLoading, setResendLoading] = useState<boolean>(false)
  const [resendDisabled, setResendDisabled] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(0)
  const navigate = useNavigate()
  const [callbackRequest, setCallbackRequest] = useState<any>(null)
  const [callbackResponse, setCallbackResponse] = useState<any>(null)
  const [callbackLoading, setCallbackLoading] = useState<boolean>(false)

  const { token, apiUrl, isDev } = useAuth()
  const appKey = 'QdQpQLCBTbkAJv0OOTYhxAdojWkot5Gk'
  const appId = '5ab32a23764f1b296b8bb386'

  let paymentMethod

  let status
  let failReason

  const handleMarkSuccess = async () => {
    if (!transaction) return
    try {
      await axios.get(`${apiUrl}/mark-paid/${transaction.u_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          appid: appId,
          appkey: appKey,
        },
      })
      alert('Marked as success')
      navigate(0) // reload halaman
    } catch (error) {
      console.error('Failed to mark as success:', error)
      alert('Failed to mark as success')
    }
  }

  const handleMarkFailed = async () => {
    if (!transaction) return
    try {
      await axios.get(`${apiUrl}/mark-failed/${transaction.u_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          appid: appId,
          appkey: appKey,
        },
      })
      alert('Marked as failed')
      navigate(0)
    } catch (error) {
      console.error('Failed to mark as failed:', error)
      alert('Failed to mark as failed')
    }
  }

  const handleResendCallback = async () => {
    if (!transaction || resendDisabled) return

    setResendLoading(true)
    setResendDisabled(true)
    const req = {
      url: `${apiUrl}/merchant/manual-callback/${transaction.u_id}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        appid: appId,
        appkey: appKey,
      },
      body: {},
    }

    setCallbackRequest(req)

    try {
      setCallbackLoading(true)

      const res = await axios.post(req.url, req.body, { headers: req.headers })
      setCallbackResponse(res.data)
      setCallbackLoading(false)

      message.success('Callback resent successfully')

      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setResendDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      console.error('Failed to resend callback:', error)
      message.error('Failed to resend callback')

      if (error.response) {
        setCallbackResponse({
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data,
        })
      } else {
        setCallbackResponse({
          error: true,
          message: error.message || 'Unknown error',
        })
      }

      setCallbackLoading(false)
      setResendDisabled(false)
    } finally {
      setResendLoading(false)
    }
  }

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      try {
        const response = await axios.get(`${apiUrl}/merchant/transaction/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            appid: appId,
            appkey: appKey,
          },
        })
        setTransaction(response.data.data)
      } catch (error) {
        console.error('Error fetching transaction detail:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactionDetail()

    return () => {}
  }, [id, token])

  if (loading) {
    return <CircularProgress />
  }

  if (!transaction) {
    return <Typography variant='h6'>Transaction not found</Typography>
  }

  failReason = transaction.fail_reason ? `(${transaction.fail_reason})` : ''

  switch (transaction.status_code) {
    case 1000:
      status = 'Success'
      break
    case 1005:
      status = 'Failed'
      break
    default:
      status = 'Pending'
      break
  }

  switch (transaction.payment_method) {
    case 'xl_airtime':
      paymentMethod = 'XL'
      break
    case 'telkomsel_airtime':
      paymentMethod = 'Telkomsel'
      break
    case 'smartfren_airtime':
      paymentMethod = 'Smartfren'
      break
    case 'indosat_airtime':
      paymentMethod = 'Indosat'
      break
    case 'tri_airtime':
      paymentMethod = 'Tri'
      break
    case 'qris':
      paymentMethod = 'Qris'
      break
    case 'gopay':
      paymentMethod = 'Gopay'
      break
    case 'shopeepay':
      paymentMethod = 'Shopeepay'
      break
  }

  return (
    <div>
      <Card className='bg-slate-100' sx={{ padding: 2 }}>
        <Typography variant='h5' sx={{ mb: 2 }}>
          Transaction Detail
        </Typography>
        <Box display='flex' flexDirection='column' gap={2}>
          {/* Row 1 */}
          <Box className='flex flex-col lg:flex-row'>
            <div className='w-full flex flex-col lg:flex-row'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Merchant Transaction ID:</strong>
              </div>
              <div>{transaction.merchant_transaction_id}</div>
            </div>

            <div className='w-full flex flex-col lg:flex-row mt-3 lg:mt-0'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>User MDN:</strong>
              </div>
              <div>{transaction.user_mdn}</div>
            </div>
          </Box>

          {/* Row 2 */}
          <Box className='flex flex-col lg:flex-row'>
            <div className='w-full flex flex-col lg:flex-row'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>User ID:</strong>
              </div>
              <div>{transaction.user_id}</div>
            </div>

            <div className='w-full flex flex-col lg:flex-row mt-3 lg:mt-0'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Payment Method:</strong>
              </div>
              <div>{paymentMethod}</div>
            </div>
          </Box>

          {/* Row 3 */}
          <Box className='flex flex-col lg:flex-row'>
            <div className='w-full flex flex-col lg:flex-row'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Currency:</strong>
              </div>
              <div>{transaction.currency}</div>
            </div>

            <div className='w-full flex flex-col lg:flex-row mt-3 lg:mt-0'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Status:</strong>
              </div>
              <div>
                {status} {failReason}
              </div>
            </div>
          </Box>

          {/* Row 4 */}
          <Box className='flex flex-col lg:flex-row'>
            <div className='w-full flex flex-col lg:flex-row'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Amount:</strong>
              </div>
              <div>{formatRupiah(transaction.amount)}</div>
            </div>

            <div className='w-full flex flex-col lg:flex-row mt-3 lg:mt-0'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Item Name:</strong>
              </div>
              <div>{transaction.item_name}</div>
            </div>
          </Box>

          {/* Row 5 */}
          <Box className='flex flex-col lg:flex-row'>
            <div className='w-full flex flex-col lg:flex-row'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Testing:</strong>
              </div>
              <div>{transaction.testing ? 'True' : 'False'}</div>
            </div>

            <div className='w-full flex flex-col lg:flex-row mt-3 lg:mt-0'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Price:</strong>
              </div>
              <div>{formatRupiah(transaction.price)}</div>
            </div>
          </Box>

          {/* Row 6 */}
          <Box className='flex flex-col lg:flex-row'>
            <div className='w-full flex flex-col lg:flex-row'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Route:</strong>
              </div>
              <div>{transaction.payment_method}</div>
            </div>

            <div className='w-full flex flex-col lg:flex-row mt-3 lg:mt-0'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>App Name:</strong>
              </div>
              <div>{transaction.app_name}</div>
            </div>
          </Box>

          {/* Row 7 */}
          <Box className='flex flex-col lg:flex-row'>
            <div className='w-full flex flex-col lg:flex-row'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Created At:</strong>
              </div>
              <div>{dayjs(transaction.created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>

            <div className='w-full flex flex-col lg:flex-row mt-3 lg:mt-0'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Updated At:</strong>
              </div>
              <div>{dayjs(transaction.updated_at).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
          </Box>

          {/* Row 8 */}
          <Box className='flex flex-col lg:flex-row'>
            <div className='w-full flex flex-col lg:flex-row'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Request Date:</strong>
              </div>
              <div>{dayjs(transaction.timestamp_request_date).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>

            <div className='w-full flex flex-col lg:flex-row mt-3 lg:mt-0'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Callback Date:</strong>
              </div>
              <div>
                {transaction.timestamp_callback_date
                  ? dayjs(transaction.timestamp_callback_date).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </div>
            </div>
          </Box>

          {/* Row 9 */}
          <Box className='flex flex-col lg:flex-row'>
            <div className='w-full flex flex-col lg:flex-row'>
              <div className='w-full lg:w-1/4 mb-1 lg:mb-0'>
                <strong>Callback Result:</strong>
              </div>
              <div>{transaction.timestamp_callback_result}</div>
            </div>

            <div className='w-full flex' />
          </Box>
        </Box>
      </Card>
      {/* <div className='flex pl-4 pt-2'>
        <Button
          type='button'
          className='mt-3 mr-4'
          size='small'
          variant='contained'
          color='info'
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button type='button' disabled className='mt-3 mr-4' variant='contained' color='success'>
          Make Success
        </Button>
      </div> */}
      <div className='flex p-5'>
        <Button
          type='button'
          className='mt-3 mr-4'
          size='small'
          variant='contained'
          color='info'
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        {transaction.status_code === 1000 || transaction.status_code === 1003 ? (
          <Button
            type='button'
            className='mt-3 mr-4'
            variant='contained'
            color='success'
            size='small'
            onClick={handleResendCallback}
            disabled={resendDisabled || resendLoading}
            sx={{
              backgroundColor: '#4caf50',
              color: 'white',
              '&:hover': {
                backgroundColor: '#45a049',
              },
              '&:disabled': {
                backgroundColor: '#cccccc',
                color: '#666666',
              },
            }}
          >
            {resendLoading ? 'Sending...' : resendDisabled ? `Resend (${countdown}s)` : 'Resend Callback'}
          </Button>
        ) : null}

        {isDev && (
          <>
            {transaction.status_code !== 1000 && (
              <Button
                type='button'
                className='mt-3 mr-4'
                variant='contained'
                color='success'
                size='small'
                onClick={handleMarkSuccess}
              >
                Mark Success
              </Button>
            )}

            {transaction.status_code !== 1005 && (
              <Button
                type='button'
                className='mt-3 mr-4'
                variant='contained'
                color='error'
                size='small'
                onClick={handleMarkFailed}
              >
                Mark Failed
              </Button>
            )}
          </>
        )}
      </div>
      {callbackRequest && (
        <div className='mt-5 w-full flex justify-center items-center'>
          <div className='w-full max-w-screen-2xl 4k:max-w-screen-xl px-2 sm:px-4 mb-10'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 4k:place-items-center'>
              {/* REQUEST BLOCK */}
              <div
                className='bg-gray-900 text-gray-200 border border-gray-700 shadow-md p-3 rounded-xl 
                w-full max-w-lg md:max-w-3xl 4k:max-w-xl mx-auto'
              >
                <div className='flex items-center justify-between mb-2'>
                  <Typography variant='subtitle1' sx={{ color: 'white', fontWeight: 600 }}>
                    Callback Request
                  </Typography>

                  {!callbackLoading && (
                    <Button
                      size='small'
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(callbackRequest, null, 2))
                        message.success('Request copied!')
                      }}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        padding: '2px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#1f2937',
                        color: '#e5e7eb',
                        '&:hover': {
                          backgroundColor: '#374151',
                          borderColor: '#4b5563',
                        },
                      }}
                    >
                      Copy
                    </Button>
                  )}
                </div>

                {/* LOADING STATE */}
                {callbackLoading && (
                  <div className='flex justify-center items-center h-48 w-full'>
                    <CircularProgress size={32} sx={{ color: 'white' }} />
                  </div>
                )}

                {/* CONTENT */}
                {!callbackLoading && (
                  <div className='rounded-lg p-2  bg-black/40 overflow-auto min-h-72  max-h-72'>
                    <pre
                      className='text-xs leading-relaxed font-mono'
                      dangerouslySetInnerHTML={{
                        __html: highlightJSON(JSON.stringify(callbackRequest, null, 2)),
                      }}
                    />
                  </div>
                )}
              </div>

              {/* RESPONSE BLOCK */}
              <div
                className='bg-gray-900 text-gray-200 border border-gray-700 shadow-md p-3 rounded-xl 
                w-full max-w-lg md:max-w-3xl 4k:max-w-xl mx-auto'
              >
                <div className='flex items-center justify-between mb-2'>
                  <Typography variant='subtitle1' sx={{ color: 'white', fontWeight: 600 }}>
                    Callback Response
                  </Typography>

                  {!callbackLoading && callbackResponse && (
                    <Button
                      size='small'
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(callbackResponse, null, 2))
                        message.success('Response copied!')
                      }}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        padding: '2px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#1f2937',
                        color: '#e5e7eb',

                        '&:hover': {
                          backgroundColor: '#374151',
                          borderColor: '#4b5563',
                        },
                      }}
                    >
                      Copy
                    </Button>
                  )}
                </div>

                {/* LOADING */}
                {callbackLoading && (
                  <div className='flex justify-center items-center h-48 w-full'>
                    <CircularProgress size={32} sx={{ color: 'white' }} />
                  </div>
                )}

                {/* CONTENT */}
                {!callbackLoading && callbackResponse && (
                  <div className='bg-black/40 rounded-lg p-2 overflow-auto min-h-72 max-h-72'>
                    <pre
                      className='text-xs leading-relaxed font-mono'
                      dangerouslySetInnerHTML={{
                        __html: highlightJSON(JSON.stringify(callbackResponse, null, 2)),
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionMerchantDetail
