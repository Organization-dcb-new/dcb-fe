// import type {} from '@mui/x-date-pickers/themeAugmentation';
// import type {} from '@mui/x-charts/themeAugmentation';
// import type {} from '@mui/x-data-grid/themeAugmentation';
// import type {} from '@mui/x-tree-view/themeAugmentation';
import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid2'
import { alpha } from '@mui/material/styles'
// import CssBaseline from '@mui/material/CssBaseline'
import { TextField, OutlinedInput, Select, MenuItem, Tooltip } from '@mui/material'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import Card from '@mui/material/Card'
import { FormLabel } from '@mui/material'

import Typography from '@mui/material/Typography'
// import AppTheme from '../styles/theme/shared-theme/AppTheme'
import { Table, DatePicker } from 'antd'

import Badge from '../components/Badge'
import { ColumnType } from 'antd/es/table'

// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
// import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import axios from 'axios'
import dayjs from 'dayjs'
import { useAuth } from '../provider/AuthProvider'
import { jwtDecode } from 'jwt-decode'

const columns: ColumnType<any>[] = [
  {
    title: 'Merchant Transaction ID',
    width: 260,
    dataIndex: 'merchant_transaction_id',
    key: 'merchant_transaction_id',
    render: (text: string) => (
      <Tooltip title='Copy Merchant Transaction ID'>
        <div
          onClick={() => navigator.clipboard.writeText(text)}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          {text}
        </div>
      </Tooltip>
    ),
  },
  {
    title: 'User MDN',
    width: 120,
    dataIndex: 'user_mdn',
    key: 'user_mdn',
  },
  {
    title: ' Date',
    width: 220,
    dataIndex: 'created_at',
    key: 'created_at',
    render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : 'N/A'),
  },
  // {
  //   title: 'End Date',
  //   width: 250,
  //   dataIndex: 'end_date',
  //   key: 'end_date',
  // },
  {
    title: 'Payment Method',
    width: 200,
    align: 'center',
    dataIndex: 'payment_method',
    key: 'payment_method',
    render: (paymentMethod: string) => {
      switch (paymentMethod) {
        case 'xl_airtime':
          return 'XL'
          break
        case 'telkomsel_airtime':
          return 'Telkomsel'
          break
      }
      return paymentMethod
    },
  },
  // {
  //   title: 'App',
  //   dataIndex: 'app_name',
  //   key: 'app_name',
  // },
  {
    title: 'Denom',
    width: 120,
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Status',
    dataIndex: 'status_code',
    align: 'center',
    key: 'status_code',
    render: (status: number) => {
      let color: 'success' | 'error' | 'pending' = 'pending'
      let text = 'Pending'

      if (status === 1000) {
        color = 'success'
        text = 'Success'
      } else if (status === 1005) {
        color = 'error'
        text = 'Failed'
      }

      return <Badge color={color} text={text} />
    },
  },
  {
    title: 'Item Name',
    width: 250,
    align: 'center',
    dataIndex: 'item_name',
    key: 'item_name',
  },
  {
    title: 'Item Name',
    width: 250,
    align: 'center',
    dataIndex: 'item_id',
    key: 'item_id',
  },
  {
    title: 'User ID',
    width: 120,
    dataIndex: 'user_id',
    key: 'user_id',
  },
  {
    title: 'Action',
    key: 'action',
    render: (record: any) => (
      <Button
        variant='outlined'
        color='success'
        className='h-6 text-sky-700 '
        onClick={() => {
          window.location.href = `/merchant-transaction/${record.merchant_transaction_id}` // Ganti dengan rute yang sesuai
        }}
      >
        Detail
      </Button>
    ),
  },
]

export default function TransactionsMerchant() {
  const [formData, setFormData] = useState({
    user_mdn: '',
    user_id: '',
    merchant_transaction_id: '',
    transaction_id: '',
    start_date: null,
    end_date: null,
    payment_method: '',
    status_code: null,
    item_name: '',
    denom: null,
  })

  const handleReset = () => {
    setFormData({
      user_mdn: '',
      user_id: '',
      merchant_transaction_id: '',
      transaction_id: '',
      start_date: null,
      end_date: null,
      payment_method: '',
      status_code: null,
      item_name: '',
      denom: null,
    })

    setResetTrigger((prev) => prev + 1)
  }

  const [data, setData] = useState([])
  // const [value, setValue] = useState(null)
  const [paymentMethod] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [total, setTotal] = useState(0)
  const { token } = useAuth()
  const decoded: any = jwtDecode(token as string)
  const { RangePicker } = DatePicker

  const denomList = [3000, 5000, 10000, 15000, 20000, 25000, 30000, 50000, 100000]

  const fetchData = async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL_API}/merchant/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          appkey: decoded.appkey,
          appid: decoded.appid,
        },
        params: {
          page: page,
          limit: limit,
          ...formData,
        },
      })
      setData(response.data.data)

      setTotal(response.data.pagination.total_items)

      // const filtered = response.data.data.filter((item: any) => {
      //   // if (item.status_code == formData.status) {
      //   console.log('Tes:', item.status_code)
      //   console.log('formdata status:', formData.status)
      //   // }
      //   if (formData.status) {
      //     return item.status_code == formData.status
      //   }
      //   return true // Jika tidak ada filter, ambil semua
      // })

      // setFilteredData(filtered)
      // console.log('status:', formData.status)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    if (decoded.role !== 'merchant') {
      window.location.href = '/merchant-transactions'
    }

    fetchData(currentPage, pageSize)
  }, [currentPage, pageSize, resetTrigger])

  const routes = [
    { name: 'All', value: '' },
    { name: 'Xl', value: 'xl_airtime' },
    { name: 'Telkomsel', value: 'telkomsel_airtime' },
  ]

  const status = [
    { name: 'All', value: '' },
    { name: 'Success', value: 1000 },
    { name: 'Pending', value: 1001 },
    { name: 'Failed', value: 1005 },
  ]

  const handleSubmit = (e: any) => {
    e.preventDefault() // Prevents the default form submission behaviour
    // Process and send formData to the server or perform other actions
    // console.log('filteredData: ', filteredData)
    fetchData()
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  // const handlePaymentChange = (event: SelectChangeEvent<typeof paymentMethod>) => {
  //   const {
  //     target: { value },
  //   } = event
  //   setPaymentMethod(
  //     // On autofill we get a stringified value.
  //     typeof value === 'string' ? value.split(',') : value,
  //   )
  // }

  const handleExport = async (type: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL_API}/merchant/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          appkey: decoded.appkey,
          appid: decoded.appid,
        },
        params: {
          export_csv: type == 'csv' ? 'true' : 'false',
          export_excel: type == 'excel' ? 'true' : 'false',
          ...formData,
        },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'transactions.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  const handleDateChange = (dates: any) => {
    const [start, end] = dates
    setFormData({
      ...formData,
      start_date: start ? start.format('ddd, DD MMM YYYY HH:mm:ss [GMT]') : null,
      end_date: end ? end.format('ddd, DD MMM YYYY HH:mm:ss [GMT]') : null,
    })
  }

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page)
    setPageSize(pageSize)
  }

  return (
    <Box
      component='main'
      sx={(theme) => ({
        flexGrow: 1,
        backgroundColor: theme.vars ? `white` : alpha(theme.palette.background.default, 1),
        overflow: 'auto',
        pt: 4,
      })}
    >
      <Stack
        spacing={2}
        sx={{
          alignItems: 'center',
          mx: 3,
          pb: 5,
          mt: { xs: 8, md: 0 },
        }}
      >
        {/* <Header /> */}
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
          <Typography component='h2' variant='h6' sx={{ mb: 2 }}>
            Redpay Transactions
          </Typography>
          <Card variant='outlined' className='p-3'>
            <span className='font-semibold'>Filter Transaction</span>
            <div>
              <form onSubmit={handleSubmit}>
                <Grid container rowSpacing={1} className='mb-2' columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid size={6}>
                    <FormLabel className='font-medium'>User MDN</FormLabel>
                    <TextField
                      variant='outlined'
                      fullWidth
                      name='user_mdn'
                      type='number'
                      value={formData.user_mdn}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={6}>
                    <FormLabel className='font-medium'>User ID</FormLabel>
                    <TextField
                      variant='outlined'
                      fullWidth
                      name='user_id'
                      value={formData.user_id}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
                <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid size={6}>
                    <FormLabel className='font-medium ' style={{ marginBottom: '8px !important' }}>
                      Merchant Trx ID
                    </FormLabel>
                    <TextField
                      variant='outlined'
                      fullWidth
                      name='merchant_transaction_id'
                      value={formData.merchant_transaction_id}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={6} className='flex flex-col'>
                    <FormLabel className='font-medium'>App Name</FormLabel>
                    <Select
                      labelId='demo-multiple-name-label'
                      id='demo-multiple-name'
                      value={paymentMethod}
                      onChange={handleChange}
                      input={<OutlinedInput label='Name' />}
                    >
                      {/* {names.map((name) => (
                        <MenuItem key={name} value={name}>
                          {name}
                        </MenuItem>
                      ))} */}
                    </Select>
                  </Grid>
                </Grid>
                {/* <Grid container rowSpacing={1} className='mb-2' columnSpacing={{ xs: 1, sm: 2, md: 3 }}></Grid> */}
                <Grid container rowSpacing={1} className='mb-2' columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  {/* <Grid size={6} className='flex flex-col'>
                    <FormLabel className='font-medium'>Start Date</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label='Select date'
                        value={value}
                        onChange={(newValue) => {
                          setValue(newValue)
                        }}
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </LocalizationProvider>
                  </Grid> */}
                  <Grid size={6} className='flex flex-col'>
                    <FormLabel className='font-medium'>Filter Date</FormLabel>
                    {/* <LocalizationProvider dateAdapter={AdapterDayjs}> */}
                    {/* <DatePicker
                        label='Select Start Date'
                        value={formData.start_date}
                        onChange={handleDateChange('start_date')}
                        renderInput={(params) => <TextField {...params} />}
                      /> */}
                    <RangePicker
                      size='large'
                      onChange={handleDateChange}
                      value={[
                        formData.start_date ? dayjs(formData.start_date, 'ddd, DD MMM YYYY HH:mm:ss [GMT]') : null,
                        formData.end_date ? dayjs(formData.end_date, 'ddd, DD MMM YYYY HH:mm:ss [GMT]') : null,
                      ]}
                    />
                    {/* </LocalizationProvider> */}
                  </Grid>
                  <Grid size={6} className='flex flex-col'>
                    <FormLabel className='font-medium'>Status</FormLabel>

                    <Select
                      labelId='status-label'
                      id='status_code'
                      onChange={handleChange}
                      name='status_code'
                      value={formData.status_code}
                      input={<OutlinedInput label='status_code' />}
                    >
                      {status.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                </Grid>
                <Grid container rowSpacing={1} className='mb-2' columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid size={6} className='flex flex-col'>
                    <FormLabel className='font-medium'>Payment Method</FormLabel>
                    <Select
                      labelId='payment-method-label'
                      id='payment-method '
                      name='payment_method'
                      value={formData.payment_method} // Pastikan ini adalah string
                      onChange={handleChange}
                      input={<OutlinedInput label='payment_method' />}
                      // fullWidth
                    >
                      {routes.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid size={6}>
                    <FormLabel className='font-medium'>Denom</FormLabel>
                    <Select
                      style={{ marginTop: '6px' }}
                      fullWidth
                      labelId='denom-label'
                      id='denom'
                      name='denom'
                      type='number'
                      value={formData.denom}
                      onChange={handleChange}
                      input={<OutlinedInput label='denom' />}
                    >
                      <MenuItem key='all' value={0}>
                        All
                      </MenuItem>
                      {denomList.map((denom) => (
                        <MenuItem key={denom} value={denom}>
                          {denom}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                </Grid>

                <Grid container rowSpacing={1} className='mb-2' columnSpacing={{ xs: 1, sm: 2, md: 3 }}></Grid>
                <Button type='submit' className='mt-3 mr-4' variant='contained' color='primary'>
                  Submit
                </Button>
                <Button type='button' className='mt-3' variant='outlined' color='inherit' onClick={handleReset}>
                  Reset
                </Button>
              </form>
            </div>
          </Card>
          <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(3) }}>
            {/* {data.map((card, index) => (
                  <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard {...card} />
                  </Grid>
                ))} */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>{/* <HighlightedCard /> */}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{/* <SessionsChart /> */}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{/* <PageViewsBarChart /> */}</Grid>
          </Grid>
          <Typography component='h2' variant='h6' sx={{ mb: 2 }}>
            Merchant Transaction Details
          </Typography>

          <Button
            size='small'
            className='border-sky-400'
            variant='outlined'
            color='info'
            onClick={() => handleExport('csv')}
          >
            Export Csv
          </Button>

          <Button
            size='small'
            className='border-sky-400 ml-3'
            variant='contained'
            color='info'
            onClick={() => handleExport('excel')}
          >
            Export Excel
          </Button>

          {/* 1540px */}
          <div style={{ overflowX: 'scroll', width: '1400px', marginTop: '14px' }}>
            <Table
              columns={columns}
              dataSource={data}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total,
                onChange: handlePageChange,
              }}
              size='small'
              className='transactions-table'
              rowKey='key'
              scroll={{ x: 1500 }} // Set a fixed width for horizontal scrolling
            />
          </div>
        </Box>
      </Stack>
    </Box>
  )
}
