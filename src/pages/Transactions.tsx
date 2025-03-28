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
// import AppNavbar from '../components/AppNavbar'
// import Header from '../components/Header'
// import CustomizedDataGrid from '../components/CustomizedDataGrid'
// import MainGrid from '../components/MainGrid'
// import SideMenu from '../components/SideMenu'
import Card from '@mui/material/Card'
// import CardContent from '@mui/material/CardContent'
import { FormLabel } from '@mui/material'

import Typography from '@mui/material/Typography'
// import AppTheme from '../styles/theme/shared-theme/AppTheme'
import { Table, DatePicker } from 'antd'
import { ColumnType } from 'antd/es/table'

import Badge from '../components/Badge'

// import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import axios from 'axios'
import dayjs from 'dayjs'
import { useAuth } from '../provider/AuthProvider'
import { jwtDecode } from 'jwt-decode'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import formatRupiah from '../utils/FormatRupiah'

dayjs.extend(utc)
dayjs.extend(timezone)

const columns: ColumnType<any>[] = [
  {
    title: 'Transaction ID',
    width: 220,
    dataIndex: 'u_id',
    key: 'u_id',
    render: (text: string) => (
      <Tooltip title='Copy Transaction ID'>
        <div onClick={() => navigator.clipboard.writeText(text)} style={{ display: 'flex', alignItems: 'center' }}>
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
    width: 100,
    dataIndex: 'created_at',
    key: 'created_at',
    render: (text: string) => (text ? dayjs(text).format('YYYY-MM-DD HH:mm:ss') : 'N/A'),
  },
  {
    title: 'Payment Method',
    width: 140,
    align: 'center',
    dataIndex: 'payment_method',
    key: 'payment_method',
    render: (paymentMethod: string) => {
      switch (paymentMethod) {
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
        case 'three_airtime':
          paymentMethod = 'Tri'
          break
      }
      return paymentMethod
    },
  },

  {
    title: 'Merchant',
    dataIndex: 'merchant_name',
    key: 'merchant_name',
  },
  {
    title: 'App',
    dataIndex: 'app_name',
    key: 'app_name',
  },
  {
    title: 'Denom',
    width: 100,
    align: 'center',
    dataIndex: 'amount',
    key: 'amount',
    render: (denom: number) => {
      return <p>{formatRupiah(denom)}</p>
    },
  },
  {
    title: 'Status',
    dataIndex: 'status_code',
    key: 'status_code',
    align: 'center',
    render: (status: number) => {
      let color: 'success' | 'error' | 'pending' | 'waiting-callback' = 'pending'
      let text = 'Pending'

      if (status === 1000) {
        color = 'success'
        text = 'Success'
      } else if (status === 1005) {
        color = 'error'
        text = 'Failed'
      } else if (status == 1003) {
        color = 'waiting-callback'
        text = 'Waiting'
      }

      return <Badge color={color} text={text} />
    },
  },

  {
    title: 'Item Name',
    width: 170,
    align: 'center',
    dataIndex: 'item_name',
    key: 'item_name',
  },
  {
    title: 'Fail Reason',
    width: 120,
    align: 'center',
    dataIndex: 'fail_reason',
    key: 'fail_reason',
  },
  // {
  //   title: 'User ID',
  //   width: 150,
  //   dataIndex: 'user_id',
  //   key: 'user_id',
  // },
  {
    title: 'Merchant Trx ID',
    width: 200,
    dataIndex: 'merchant_transaction_id',
    key: 'merchant_transaction_id',
    render: (text: string) => (
      <Tooltip title='Copy Merchant Trx ID'>
        <div onClick={() => navigator.clipboard.writeText(text)} style={{ display: 'flex', alignItems: 'center' }}>
          {text}
        </div>
      </Tooltip>
    ),
  },
  {
    title: 'Action',
    width: 120,
    key: 'action',
    align: 'center',
    fixed: 'right',
    render: (record: any) => (
      <Button
        variant='outlined'
        color='success'
        className='h-6 text-sky-700 '
        onClick={() => {
          window.location.href = `/transaction/${record.u_id}`
        }}
      >
        Detail
      </Button>
    ),
  },
]

export default function Transactions() {
  const [formData, setFormData] = useState<{
    user_mdn: string
    user_id: string
    merchant_transaction_id: string
    transaction_id: string
    merchant_name: string[]
    payment_method: string[]
    payment_status: string
    status: number | null
    start_date: string | null // Pastikan ini adalah string | null
    end_date: string | null // Pastikan ini adalah string | null
    app_name: string
    item_name: string
    denom: number | null
  }>({
    user_mdn: '',
    user_id: '',
    merchant_transaction_id: '',
    transaction_id: '',
    merchant_name: [],
    payment_method: [],
    payment_status: '',
    status: null,
    start_date: null,
    end_date: null,
    app_name: '',
    item_name: '',
    denom: null,
  })

  const [data, setData] = useState([])

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [isFiltered, setIsFiltered] = useState(false)
  const [resetTrigger, setResetTrigger] = useState(0)
  const { token, apiUrl } = useAuth()
  const decoded: any = jwtDecode(token as string)
  const { RangePicker } = DatePicker

  const merchantList = [
    { id: 1, name: 'HIGO GAME PTE LTD' },
    { id: 2, name: 'Redigame' },
    { id: 3, name: 'PT WAHANA VENTURINDO GALAMEGA' },
    { id: 4, name: 'PT Jaya Permata Elektro' },
    { id: 5, name: 'Evos Store' },
    { id: 6, name: 'Zingplay International PTE,. LTD' },
    { id: 7, name: 'CYNKING' },
    { id: 8, name: 'Coda' },
    { id: 9, name: 'EMGLINK' },
    { id: 10, name: 'FUNBID' },
    { id: 11, name: 'WEIDIAN TECHNOLOGY CO' },
    { id: 12, name: 'PM Max' },
    { id: 13, name: 'SHAKE GAME PTE.LTD' },
    { id: 14, name: 'Pt Beta Karya Transaksi (TWIG)' },
    { id: 15, name: 'Spofeed' },
  ]

  const appList = [
    { id: 1, name: 'Royal Domino' },
    { id: 2, name: 'Redigame' },
    { id: 3, name: 'Wavegame - 3 Kingdom' },
    { id: 4, name: 'Evos Top Up' },
    { id: 5, name: 'Zingplay games' },
    { id: 6, name: 'Full Electricals' },
    { id: 7, name: 'Codashop' },
    { id: 8, name: 'Cynking' },
    { id: 9, name: 'EMG' },
    { id: 10, name: 'Funbid' },
    { id: 11, name: 'PM Max' },
    { id: 12, name: 'Topfun' },
    { id: 13, name: 'Spofeed' },
    { id: 14, name: 'PG777' },
    { id: 15, name: 'Duoleworld' },
  ]

  const denomList = [3000, 5000, 10000, 15000, 20000, 25000, 30000, 50000, 100000]

  const fetchData = async (page = 1, limit = 10) => {
    try {
      const start_date = formData.start_date ? dayjs.tz(formData.start_date, 'Asia/Jakarta').startOf('day') : null

      const end_date = formData.end_date ? dayjs.tz(formData.end_date, 'Asia/Jakarta').endOf('day') : null
      const response = await axios.get(`${apiUrl}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          page: page,
          limit: limit,
          start_date,
          end_date,
          user_mdn: formData.user_mdn,
          user_id: formData.user_id,
          merchant_transaction_id: formData.merchant_transaction_id,
          transaction_id: formData.transaction_id,
          merchant_name: formData.merchant_name.join(','),
          app_name: formData.app_name,
          payment_method: formData.payment_method.join(','),
          status: formData.status,
          item_name: formData.item_name,
          denom: formData.denom,
        },
      })
      setData(response.data.data)

      setTotal(response.data.pagination.total_items)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    if (decoded.role == 'merchant') {
      window.location.href = '/merchant-transactions'
    }

    fetchData(currentPage, pageSize)
  }, [currentPage, pageSize, resetTrigger])

  const routes = [
    { name: 'All', value: '' },
    { name: 'Xl', value: 'xl_airtime' },
    { name: 'Telkomsel', value: 'telkomsel_airtime' },
    { name: 'Tri', value: 'three_airtime' },
    { name: 'Indosat', value: 'indosat_airtime' },
    { name: 'Smartfren', value: 'smartfren_airtime' },
    { name: 'Gopay', value: 'gopay' },
    { name: 'Shopeepay', value: 'shopeepay' },
    { name: 'Qris', value: 'qris' },
  ]

  const status = [
    { name: 'All', value: '' },
    { name: 'Success', value: 1000 },
    { name: 'Pending', value: 1001 },
    { name: 'Waiting', value: 1003 },
    { name: 'Failed', value: 1005 },
  ]

  const handleSubmit = (e: any) => {
    e.preventDefault() // Prevents the default form submission behaviour
    // Process and send formData to the server or perform other actions
    // console.log('filteredData: ', filteredData)
    setIsFiltered(true)
    fetchData()
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target

    if (typeof name === 'string') {
      if (name === 'payment_method' || name === 'merchant_name') {
        const newValue = typeof value === 'string' ? value.split(',') : value
        setFormData({ ...formData, [name]: newValue })
      } else {
        setFormData({ ...formData, [name]: value })
      }
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

  const handleReset = () => {
    setFormData({
      user_mdn: '',
      user_id: '',
      merchant_transaction_id: '',
      transaction_id: '',
      merchant_name: [],
      app_name: '',
      payment_method: [],
      payment_status: '',
      status: null,
      item_name: '',
      denom: null,
      start_date: null,
      end_date: null,
    })
    setIsFiltered(false)
    setResetTrigger((prev) => prev + 1)
  }

  const handleExport = async (type: string) => {
    try {
      const start_date = formData.start_date ? dayjs.tz(formData.start_date, 'Asia/Jakarta').startOf('day') : null

      const end_date = formData.end_date ? dayjs.tz(formData.end_date, 'Asia/Jakarta').endOf('day') : null
      const response = await axios.get(`${apiUrl}/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          export_csv: type == 'csv' ? 'true' : 'false',
          export_excel: type == 'excel' ? 'true' : 'false',
          status: formData.status,
          payment_method: formData.payment_method[0],
          merchant_name: formData.merchant_name[0],
          app_name: formData.app_name,
          start_date,
          end_date,
        },
        responseType: 'blob',
      })

      const extension = type == 'csv' ? 'csv' : 'xlsx'
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `transactions.${extension}`) // Nama file yang diunduh
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
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
        <Box sx={{ width: '100%', maxWidth: '96vw' }}>
          {/* cards */}
          <Typography component='h2' variant='h6' sx={{ mb: 2 }}>
            Redpay Transactions
          </Typography>
          <Card variant='outlined' className='p-3'>
            <span className='font-semibold'>Filter Transaction</span>
            <div className='mt-3'>
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
                <Grid container rowSpacing={1} className='mb-2' columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid size={6}>
                    <FormLabel className='font-medium'>Merchant Trx ID</FormLabel>
                    <TextField
                      variant='outlined'
                      fullWidth
                      name='merchant_transaction_id'
                      value={formData.merchant_transaction_id}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid size={6}>
                    <FormLabel className='font-medium'>Transaction ID</FormLabel>
                    <TextField
                      variant='outlined'
                      fullWidth
                      name='transaction_id'
                      value={formData.transaction_id}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
                <Grid container rowSpacing={1} className='mb-2' columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
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
                      showTime={{ format: 'HH:mm' }} // Menampilkan pilihan jam dan menit
                      format='YYYY-MM-DD HH:mm' // Format tampilan dengan jam & menit
                      onChange={handleDateChange}
                      value={[
                        formData.start_date ? dayjs(formData.start_date, 'ddd, DD MMM YYYY HH:mm:ss [GMT]') : null,
                        formData.end_date ? dayjs(formData.end_date, 'ddd, DD MMM YYYY HH:mm:ss [GMT]') : null,
                      ]}
                    />
                    {/* </LocalizationProvider> */}
                  </Grid>
                  <Grid size={6} className='flex flex-col'>
                    <FormLabel className='font-medium'>App</FormLabel>
                    <Select
                      labelId='merchant-label'
                      id='app_name'
                      name='app_name'
                      value={formData.app_name}
                      onChange={handleChange}
                      input={<OutlinedInput label='app_name' />}
                    >
                      {appList.map((app) => (
                        <MenuItem key={app.id} value={app.name}>
                          {app.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                </Grid>
                <Grid container rowSpacing={1} className='mb-2' columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid size={6} className='flex flex-col'>
                    <FormLabel className='font-medium'>Payment Method</FormLabel>
                    <Select
                      multiple
                      labelId='payment-method-label'
                      id='payment-method '
                      name='payment_method'
                      value={formData.payment_method}
                      onChange={handleChange}
                      input={<OutlinedInput label='payment_method' />}
                      renderValue={(selected) => selected.join(', ')}
                    >
                      {routes.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid size={6} className='flex flex-col'>
                    <FormLabel className='font-medium'>Status</FormLabel>

                    <Select
                      labelId='status-label'
                      id='status'
                      onChange={handleChange}
                      name='status'
                      value={formData.status}
                      input={<OutlinedInput label='status' />}
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
                    <FormLabel className='font-medium'>Merchant</FormLabel>

                    <Select
                      labelId='merchant-label'
                      multiple
                      id='merchant_name'
                      name='merchant_name'
                      value={formData.merchant_name}
                      onChange={handleChange}
                      renderValue={(selected) => selected.join(', ')}
                      input={<OutlinedInput label='merchant_name' />}
                    >
                      {merchantList.map((merchant) => (
                        <MenuItem key={merchant.id} value={merchant.name}>
                          {merchant.name}
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
          <Grid container spacing={2} columns={12} sx={{ mb: (theme) => theme.spacing(4) }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>{/* <HighlightedCard /> */}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{/* <SessionsChart /> */}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{/* <PageViewsBarChart /> */}</Grid>
          </Grid>
          <Typography component='h2' variant='h6' sx={{ mb: 2 }}>
            Transaction Details
          </Typography>
          <div className='flex items-center justify-between'>
            <div>
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
                className='border-sky-400 ml-4'
                variant='contained'
                color='info'
                onClick={() => handleExport('excel')}
              >
                Export Excel
              </Button>
            </div>
            {isFiltered && <Typography variant='subtitle1'>Total Items: {total}</Typography>}
          </div>

          {/* 1540px */}

          <div className='mt-5'>
            <Table
              columns={columns}
              dataSource={data}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: total >= 20000 ? 20000 : total,
                onChange: handlePageChange,
              }}
              size='small'
              className='transactions-table '
              rowKey='key'
              scroll={{ x: 'max-content' }}
            />
          </div>
        </Box>
      </Stack>
    </Box>
  )
}
