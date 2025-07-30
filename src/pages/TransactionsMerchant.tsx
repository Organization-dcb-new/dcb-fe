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
import { Table, DatePicker } from 'antd'

import Badge from '../components/Badge'
import { ColumnType } from 'antd/es/table'
import formatRupiah from '../utils/FormatRupiah'

import axios from 'axios'
import dayjs from 'dayjs'
import { useAuth } from '../provider/AuthProvider'
import { jwtDecode } from 'jwt-decode'
import { useClient } from '../context/ClientContext'

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
    width: 100,
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
    title: 'App',
    dataIndex: 'app_name',
    key: 'app_name',
  },
  {
    title: 'Denom',
    width: 120,
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
    width: 180,
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
    width: 200,
    align: 'center',
    dataIndex: 'item_name',
    key: 'item_name',
  },
  {
    title: 'Item ID',
    width: 180,
    align: 'center',
    dataIndex: 'item_id',
    key: 'item_id',
  },
  {
    title: 'User ID',
    width: 120,
    align: 'center',
    dataIndex: 'user_id',
    key: 'user_id',
  },
  {
    title: 'Action',
    key: 'action',
    fixed: 'right',
    render: (record: any) => (
      <Button
        variant='outlined'
        color='success'
        className='h-6 text-sky-700 '
        onClick={() => {
          window.location.href = `/merchant-transaction/${record.u_id}` // Ganti dengan rute yang sesuai
        }}
      >
        Detail
      </Button>
    ),
  },
]

export default function TransactionsMerchant() {
  const [formData, setFormData] = useState<{
    user_mdn: string
    user_id: string
    merchant_transaction_id: string
    transaction_id: string
    payment_method: string[]
    status: number | null
    start_date: dayjs.Dayjs | null
    end_date: dayjs.Dayjs | null
    app_name: string
    item_name: string
    denom: number | null
  }>({
    user_mdn: '',
    user_id: '',
    merchant_transaction_id: '',
    transaction_id: '',
    payment_method: [],
    status: null,
    start_date: dayjs().startOf('day'),
    end_date: dayjs().endOf('day'),
    app_name: '',
    item_name: '',
    denom: null,
  })

  const handleReset = () => {
    setFormData({
      user_mdn: '',
      user_id: '',
      merchant_transaction_id: '',
      transaction_id: '',
      payment_method: [],
      status: null,
      start_date: dayjs().startOf('day'),
      end_date: dayjs().endOf('day'),
      app_name: '',
      item_name: '',
      denom: null,
    })
    setIsFiltered(false)

    setResetTrigger((prev) => prev + 1)
  }

  const [data, setData] = useState([])
  // const [value, setValue] = useState(null)
  const [paymentMethod] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isFiltered, setIsFiltered] = useState(false)
  const [resetTrigger, setResetTrigger] = useState(0)
  const [total, setTotal] = useState(0)
  const { token, apiUrl, appId, appKey } = useAuth()
  const { client, loading: clientLoading } = useClient()
  const decoded: any = jwtDecode(token as string)
  const { RangePicker } = DatePicker

  const denomList = [3000, 5000, 10000, 15000, 20000, 25000, 30000, 50000, 100000]

  const fetchData = async (page = 1, limit = 10) => {
    try {
      const start_date = formData.start_date
        ? dayjs(formData.start_date).utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]')
        : null

      const end_date = formData.end_date
        ? dayjs(formData.end_date).utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]')
        : null

      const response = await axios.get(`${apiUrl}/merchant/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          appkey: appKey,
          appid: appId,
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
          app_name: formData.app_name,
          payment_method: formData.payment_method.join(','),
          status: formData.status,
          item_name: formData.item_name,
          denom: formData.denom,
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
  }, [currentPage, pageSize, resetTrigger, appId, appKey])

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
    { name: 'Ovo', value: 'ovo' },
    { name: 'Dana', value: 'dana' },
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
    setIsFiltered(true)
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
      const start_date = formData.start_date
        ? dayjs(formData.start_date).utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]')
        : null

      const end_date = formData.end_date
        ? dayjs(formData.end_date).utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]')
        : null

      const response = await axios.get(`${apiUrl}/export/transactions-merchant`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          appkey: decoded.appkey,
          appid: decoded.appid,
        },
        params: {
          export_csv: type == 'csv' ? 'true' : 'false',
          export_excel: type == 'excel' ? 'true' : 'false',
          status: formData.status,
          payment_method: formData.payment_method[0],
          app_name: formData.app_name,
          start_date,
          end_date,
        },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url

      const extension = type == 'csv' ? 'csv' : 'xlsx'

      link.setAttribute('download', `transactions.${extension}`)
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
      start_date: start,
      end_date: end,
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
                      labelId='app-name-label'
                      id='app_name'
                      name='app_name'
                      value={formData.app_name}
                      onChange={handleChange}
                      input={<OutlinedInput label='App Name' />}
                      disabled={clientLoading}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 350,
                          },
                        },
                      }}
                    >
                      <MenuItem value=''>
                        <em>All Apps</em>
                      </MenuItem>
                      {client?.apps?.map((app) => (
                        <MenuItem key={app.id} value={app.app_name}>
                          {app.app_name}
                        </MenuItem>
                      ))}
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
                      showTime={{ format: 'HH:mm:ss' }}
                      format='YYYY-MM-DD HH:mm'
                      onChange={handleDateChange}
                      value={[formData.start_date, formData.end_date]}
                    />
                    {/* </LocalizationProvider> */}
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
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>{/* <HighlightedCard /> */}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{/* <SessionsChart /> */}</Grid>
            <Grid size={{ xs: 12, md: 6 }}>{/* <PageViewsBarChart /> */}</Grid>
          </Grid>
          <Typography component='h2' variant='h6' sx={{ mb: 2 }}>
            Merchant Transaction Details
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
                disabled
                className='border-sky-400 ml-3'
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
              className='transactions-table'
              rowKey='key'
              scroll={{ x: 'max-content' }}
            />
          </div>
        </Box>
      </Stack>
    </Box>
  )
}
