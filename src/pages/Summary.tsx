import dayjs from 'dayjs'
import { DatePicker, Form, Select, Table } from 'antd'
import { alpha } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { capitalizeLetter } from '../utils/Capitalize'
import SummaryChart from '../components/SummaryChart'

const keyToLabel: { [key: string]: string } = {
  success: 'Success',
  canceled: 'Canceled',
  failed: 'Failed',
}
const mockDataChart = [
  { datetime: 1740787200, success: 3804, canceled: 2500, failed: 2767 },
  { datetime: 1740873600, success: 4336, canceled: 1940, failed: 2826 },
  { datetime: 1740960000, success: 4654, canceled: 1938, failed: 1000 },
  { datetime: 1741046400, success: 4591, canceled: 2079, failed: 2825 },
  { datetime: 1741132800, success: 4755, canceled: 1274, failed: 2790 },
  { datetime: 1741219200, success: 3009, canceled: 2889, failed: 2811 },
  { datetime: 1741305600, success: 3005, canceled: 1707, failed: 2989 },
  { datetime: 1741392000, success: 3089, canceled: 2747, failed: 2893 },
  { datetime: 1741478400, success: 4992, canceled: 1781, failed: 2798 },
  { datetime: 1741564800, success: 4893, canceled: 2351, failed: 2705 },
  { datetime: 1741651200, success: 4641, canceled: 1795, failed: 2064 },
  { datetime: 1741737600, success: 4654, canceled: 1302, failed: 2914 },
  { datetime: 1741824000, success: 3327, canceled: 4500, failed: 500 },
]

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

interface SummaryProps {
  type?: 'hourly' | 'daily' | 'monthly'
}
export default function Summary({ type = 'hourly' }: SummaryProps) {
  const dataSource = [
    {
      date: '2021-10-10',
      total: 1000,
      success: 3804,
      pending: 1000,
      failed: 2767,
      revenue: 1000,
      payment_method: 'Pulsa',
    },

    {
      date: '2021-10-10',
      total: 1000,
      success: 3804,
      pending: 1000,
      failed: 2767,
      revenue: 1000,
      payment_method: 'Pulsa',
    },

    {
      date: '2021-10-10',
      total: 1000,
      success: 3804,
      pending: 1000,
      failed: 2767,
      revenue: 1000,
      payment_method: 'Qris',
    },
  ]

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (value: number) => dayjs(new Date(value)).format('DD MMM YYYY'),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Success',
      dataIndex: 'success',
      key: 'success',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Pending',
      dataIndex: 'pending',
      key: 'pending',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Failed',
      dataIndex: 'failed',
      key: 'failed',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (value: number) => formatNumber(value),
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
    },
  ]

  return (
    <Box
      component='main'
      sx={(theme) => ({
        flexGrow: 1,
        backgroundColor: theme.vars ? `white` : alpha(theme.palette.background.default, 1),
        overflow: 'auto',
        p: 3,
      })}
    >
      <div className='flex gap-4 items-end justify-between mb-6'>
        <Typography variant='h2' fontWeight='bold' fontSize={18}>
          Summary {capitalizeLetter(type)}
        </Typography>
        <Form className='flex gap-4 items-end justify-between'>
          <Form.Item label='Date' layout='vertical'>
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item label='Status' layout='vertical' className='w-40'>
            <Select defaultValue='success'>
              <Select.Option value='all'>All</Select.Option>
              <Select.Option value='success'>Success</Select.Option>
              <Select.Option value='pending'>Pending</Select.Option>
              <Select.Option value='failed'>Failed</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label='Payment Method' layout='vertical' className='w-40'>
            <Select defaultValue='all'>
              <Select.Option value='all'>All</Select.Option>
              <Select.Option value='ovo'>OVO</Select.Option>
              <Select.Option value='qris'>Qris</Select.Option>
              <Select.Option value='pulsa'>Pulsa</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </div>
      <div className='flex flex-col gap-4'>
        <div className='2xl:w-3/4'>
          <SummaryChart keyToLabel={keyToLabel} dataset={mockDataChart} />
        </div>
        <Table dataSource={dataSource} columns={columns} />
      </div>
    </Box>
  )
}
