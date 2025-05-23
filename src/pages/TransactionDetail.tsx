// TransactionDetail.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import { Modal } from 'antd'
import axios from 'axios'
import dayjs from 'dayjs'
import { Typography, Card, CircularProgress, Box } from '@mui/material'
import { useAuth } from '../provider/AuthProvider'
import formatRupiah from '../utils/FormatRupiah'

interface Transaction {
  u_id: string
  user_mdn: string
  payment_method: string
  user_id: string
  status_code: number
  created_at: string
  merchant_transaction_id: string
  currency: string
  amount: number
  item_name: string
  client_appkey: string
  testing: boolean
  price: number
  appid: string
  merchant_name: string
  app_name: string
  updated_at: Date
  ximpay_id: string
  reference_id: string
  midtrans_transaction_id: string
  timestamp_request_date: Date
  receive_callback_date: Date
  timestamp_submit_date: Date
  timestamp_callback_date: Date
  timestamp_callback_result: string
}

const TransactionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>() // Ambil u_id dari URL
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [transactionStatus, setTransactionStatus] = useState<{
    status: string
    responseDesc: string
    json: string
  } | null>(null)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const { token, apiUrl } = useAuth()

  let paymentMethod

  let status

  const handleCheckCharging = async () => {
    try {
      const requestOptions = {
        method: 'GET',
      }

      const response = await fetch(`${apiUrl}/check/${id}`, requestOptions)

      const result = await response.json()
      console.log('result', result.data.transactionInquiryStatusTO.responseCode)

      if (result.data.transactionInquiryStatusTO.responseCode == '00') {
        setTransactionStatus({
          status: 'Success',
          responseDesc: result.data.transactionInquiryStatusTO.responseDesc,
          json: '',
        })
      } else {
        setTransactionStatus({
          status: 'error',
          responseDesc: 'Transaction failed',
          json: '',
        })
      }

      setOpen(true)
    } catch (error) {
      console.error('Error checking charging:', error)
      setTransactionStatus({
        status: 'Error',
        responseDesc: 'Failed to fetch transaction status',
        json: '',
      })
      setOpen(true)
    }
  }

  const handleCheckStatusDana = async () => {
    try {
      const response = await fetch(`${apiUrl}/check-status/dana/${transaction?.reference_id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok && result.data?.response?.body?.statusDetail?.acquirementStatus == 'SUCCESS') {
        setTransactionStatus({
          status: 'Success',
          responseDesc: '',
          json: result.data?.response,
        })
      } else {
        setTransactionStatus({
          status: 'Failed',
          // responseDesc: result.data?.response || 'Transaction failed or unknown response',
          responseDesc: '',
          json: result.data?.response,
        })
      }
    } catch (error) {
      console.error('Error checking DANA transaction:', error)
      setTransactionStatus({
        status: 'Error',
        responseDesc: 'Failed to check transaction status with DANA.',
        json: '',
      })
    } finally {
      setOpen(true)
    }
  }

  const handleCheckStatusOvo = async () => {
    try {
      const response = await fetch(`${apiUrl}/check-status/ovo/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      console.log('result: ', result)
      if (response.ok && result.data?.responseCode == '00') {
        setTransactionStatus({
          status: 'Success',
          responseDesc: '',
          json: result.data,
        })
      } else {
        setTransactionStatus({
          status: 'Failed',
          // responseDesc: result.data?.response || 'Transaction failed or unknown response',
          responseDesc: '',
          json: result.data,
        })
      }
    } catch (error) {
      console.error('Error checking OVO transaction:', error)
      setTransactionStatus({
        status: 'Error',
        responseDesc: 'Failed to check transaction status with OVO.',
        json: '',
      })
    } finally {
      setOpen(true)
    }
  }

  const handleManualCallback = async () => {
    try {
      const response = await fetch(`${apiUrl}/manual-callback/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transaction_id: transaction?.u_id,
          merchant_transaction_id: transaction?.merchant_transaction_id,
          status_code: 1000,
          message: 'Transaction updated',
        }),
      })

      const result = await response.json()
      console.log('Manual callback result:', result)

      if (response.ok) {
        Modal.success({
          title: 'Manual Callback Success',
          content: `Message: ${result.message}`,
        })
      } else {
        throw new Error(result.message || 'Failed to update transaction')
      }
    } catch (error) {
      console.error('Error during manual callback:', error)
      Modal.error({
        title: 'Manual Callback Failed',
        content: 'An error occurred while processing the manual callback.',
      })
    }
  }

  const handleOk = () => {
    setOpen(false)
  }

  const handleCancel = () => {
    console.log('Clicked cancel button')
    setOpen(false)
  }

  useEffect(() => {
    const fetchTransactionDetail = async () => {
      try {
        const response = await axios.get(`${apiUrl}/transaction/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
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
  }, [id, token])

  if (loading) {
    return <CircularProgress />
  }

  if (!transaction) {
    return <Typography variant='h6'>Transaction not found</Typography>
  }

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

  let referenceId

  switch (transaction.payment_method) {
    case 'three_airtime':
      referenceId = transaction.ximpay_id
      break
    case 'indosat_airtime':
      referenceId = transaction.ximpay_id
      break
    case 'smartfren_airtime':
      referenceId = transaction.ximpay_id
      break
    case 'gopay':
      referenceId = transaction.midtrans_transaction_id
      break
    case 'shopeepay':
      referenceId = transaction.midtrans_transaction_id
      break
    case 'qris':
      referenceId = transaction.midtrans_transaction_id
      break
    default:
      referenceId = transaction.reference_id
      break
  }

  const checkCharging =
    transaction.payment_method == 'xl_airtime' ||
    transaction.payment_method == 'dana' ||
    transaction.payment_method == 'ovo'

  return (
    <div>
      <Card className='bg-slate-100' sx={{ padding: 2 }}>
        <Typography variant='h5' sx={{ mb: 2 }}>
          Transaction Detail
        </Typography>
        <Box display='flex' flexDirection='column' gap={2}>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong> Transaction ID:</strong>
              </div>
              <div> {transaction.u_id}</div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>User MDN:</strong>
              </div>
              <div>{transaction.user_mdn}</div>
            </div>
          </Box>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong> User ID:</strong>
              </div>
              <div> {transaction.user_id}</div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Merchant Transaction ID:</strong>
              </div>
              <div>{transaction.merchant_transaction_id}</div>
            </div>
          </Box>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong> Payment Method:</strong>
              </div>
              <div> {paymentMethod}</div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Currency:</strong>
              </div>
              <div>{transaction.currency}</div>
            </div>
          </Box>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong> Amount :</strong>
              </div>
              <div> {formatRupiah(transaction.amount)}</div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Item Name:</strong>
              </div>
              <div>{transaction.item_name}</div>
            </div>
          </Box>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong> Client AppKey :</strong>
              </div>
              <div> {transaction.client_appkey}</div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Status:</strong>
              </div>
              <div>{status}</div>
            </div>
          </Box>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Refference ID :</strong>
              </div>
              <div>{referenceId}</div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Price:</strong>
              </div>
              <div>{formatRupiah(transaction.price)}</div>
            </div>
          </Box>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Route :</strong>
              </div>
              <div> {transaction.payment_method}</div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>App ID:</strong>
              </div>
              <div>{transaction.appid}</div>
            </div>
          </Box>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Merchant Name :</strong>
              </div>
              <div> {transaction.merchant_name}</div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>App Name:</strong>
              </div>
              <div>{transaction.app_name}</div>
            </div>
          </Box>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Created At:</strong>
              </div>
              <div>{dayjs(transaction.created_at).format('YYYY-MM-DD HH:mm:ss.SSS')}</div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Updated At:</strong>
              </div>
              <div> {dayjs(transaction.updated_at).format('YYYY-MM-DD HH:mm:ss.SSS')}</div>
            </div>
          </Box>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Request Date:</strong>
              </div>
              <div> {dayjs(transaction.timestamp_request_date).format('YYYY-MM-DD HH:mm:ss.SSS')} </div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Callback Date:</strong>
              </div>
              <div>
                {transaction.timestamp_callback_date
                  ? dayjs(transaction.timestamp_callback_date).format('YYYY-MM-DD HH:mm:ss.SSS')
                  : '-'}{' '}
              </div>
            </div>
          </Box>
          <Box display='flex'>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Receive Callback Date:</strong>
              </div>
              <div>
                {transaction.receive_callback_date
                  ? dayjs(transaction.receive_callback_date).format('YYYY-MM-DD HH:mm:ss.SSS')
                  : '-'}{' '}
              </div>
            </div>
            <div className='w-full flex'>
              <div className='w-1/4'>
                <strong>Callback result:</strong>
              </div>
              <div>{transaction.timestamp_callback_result}</div>
            </div>
          </Box>
        </Box>
      </Card>
      <div className='flex pl-4 pt-2'>
        <Button
          type='button'
          className='mt-3 mr-4'
          onClick={() => {
            if (transaction.payment_method === 'dana') {
              handleCheckStatusDana()
            } else if (transaction.payment_method === 'ovo') {
              handleCheckStatusOvo()
            } else {
              handleCheckCharging()
            }
          }}
          disabled={!checkCharging}
          variant='contained'
          color='info'
        >
          Check Charging
        </Button>
        <Button
          type='button'
          disabled={transaction.status_code != 1003 && transaction.status_code != 1000}
          className='mt-3 mr-4'
          onClick={handleManualCallback}
          variant='contained'
          color='info'
        >
          Manual Callback
        </Button>
        <Button type='button' className='mt-3 mr-4' variant='contained' color='primary' onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      <Modal title='Transaction' open={open} onOk={handleOk} width={400} onCancel={handleCancel} centered>
        <p>Status : {transactionStatus?.status}</p>
        <p>Desc : {transactionStatus?.responseDesc}</p>
        <p>Response Json:</p>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '400px', overflowY: 'auto' }}>
          {typeof transactionStatus?.json === 'string'
            ? transactionStatus.json
            : JSON.stringify(transactionStatus?.json, null, 2)}
        </pre>
      </Modal>
    </div>
  )
}

export default TransactionDetail
