import React, { useEffect, useState } from 'react'
import { Table, Tag, Typography, Spin, message, DatePicker, Select, Input, Button, Row, Col, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useAuth } from '../provider/AuthProvider'
import { useMerchants } from '../context/MerchantContext'

import axios from 'axios'
import dayjs, { Dayjs } from 'dayjs'

const { Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

export interface TransactionDailySummary {
  date: string
  status: string
  payment_method: string
  amount: number
  route: string
  merchant_name: string
  total: number
  revenue: number
}

const paymentMethods = [
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
  { name: 'Va Bca', value: 'va_bca' },
]

const TransactionSummaryPage: React.FC = () => {
  const [data, setData] = useState<TransactionDailySummary[]>([])
  const [loading, setLoading] = useState(false)
  const { merchants, error } = useMerchants()

  // Filter state
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [merchantName, setMerchantName] = useState('')
  const [status, setStatus] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [route, setRoute] = useState('')
  const { apiUrl } = useAuth()

  const fetchSummary = async () => {
    setLoading(true)
    try {
      const params: any = {}

      if (dateRange) {
        params.start_date = dateRange[0].toISOString()
        params.end_date = dateRange[1].toISOString()
      }
      if (merchantName) params.merchant = merchantName
      if (status) params.status = status
      if (paymentMethod) params.payment_method = paymentMethod
      if (route) params.route = route

      const res = await axios.get<{ data: TransactionDailySummary[] }>(`${apiUrl}/summary/transaction`, { params })
      setData(res.data.data)
    } catch (error) {
      message.error('Failed to fetch summary data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format: 'csv' | 'excel') => {
    const params = new URLSearchParams()

    if (dateRange) {
      if (dateRange[0]) params.append('start_date', dayjs(dateRange[0]).format('YYYY-MM-DD'))
      if (dateRange[1]) params.append('end_date', dayjs(dateRange[1]).format('YYYY-MM-DD'))
    }

    if (merchantName) params.append('merchant', merchantName)
    if (status) params.append('status', status)
    if (paymentMethod) params.append('payment_method', paymentMethod)
    if (route) params.append('route', route)

    params.append('format', format)

    const url = `${apiUrl}/summary/transaction?${params.toString()}`
    window.open(url, '_blank')
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const columns: ColumnsType<TransactionDailySummary> = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD MMMM YYYY'),
    },
    {
      title: 'Merchant',
      dataIndex: 'merchant_name',
      key: 'merchant_name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default'
        if (status === 'success') color = 'green'
        else if (status === 'pending') color = 'orange'
        else if (status === 'failed') color = 'red'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: 'Payment Method',
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
      title: 'Channel',
      dataIndex: 'route',
      key: 'route',
      render: (text) => <Text ellipsis={{ tooltip: text }}>{text}</Text>,
    },
    {
      title: 'Price',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `Rp ${amount?.toLocaleString('id-ID')}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => `Rp ${revenue?.toLocaleString('id-ID')}`,
    },
  ]

  const handleFilter = () => {
    fetchSummary()
  }

  const handleReset = () => {
    setDateRange(null)
    setMerchantName('')
    setStatus('')
    setPaymentMethod('')
    setRoute('')
    fetchSummary()
  }

  return (
    <div className='p-10'>
      <Typography.Title level={3}>Transaction Daily Summary</Typography.Title>

      <Row gutter={[16, 8]} style={{ marginBottom: 8 }}>
        <Col span={6}>
          <Text>Date Range</Text>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
            style={{ width: '100%' }}
          />
        </Col>
        <Col span={6}>
          <Text>Merchant</Text>
          <Select
            showSearch
            placeholder='Select merchant'
            value={merchantName}
            onChange={(value) => setMerchantName(value)}
            allowClear
            style={{ width: '100%' }}
            optionFilterProp='children'
            filterOption={(input, option) =>
              (option?.label?.toString() || '').toLowerCase().includes(input.toLowerCase())
            }
            loading={!merchants.length && !error}
          >
            {merchants.map((merchant) => (
              <Option key={merchant.u_id} value={merchant.client_name}>
                {merchant.client_name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* Baris 2 */}
      <Row gutter={[16, 8]} style={{ marginBottom: 8 }}>
        <Col span={6}>
          <Text>Status</Text>
          <Select
            placeholder='Select status'
            value={status}
            onChange={(value) => setStatus(value)}
            allowClear
            style={{ width: '100%' }}
          >
            <Option value='success'>Success</Option>
            <Option value='pending'>Pending</Option>
            <Option value='failed'>Failed</Option>
          </Select>
        </Col>
        <Col span={6} className='flex flex-col'>
          <Text>Payment Method</Text>
          <Select
            // style={{ width: 200 }}
            placeholder='Select Payment Method'
            value={paymentMethod}
            onChange={(value) => setPaymentMethod(value)}
            allowClear
            showSearch
            optionFilterProp='children'
          >
            {paymentMethods.map((pm) => (
              <Select.Option key={pm.value} value={pm.value}>
                {pm.name}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* Baris 3 */}
      <Row gutter={[16, 16]}>
        <Col span={6} className='!mb-10'>
          <Text>Route</Text>
          <Input placeholder='Route' value={route} onChange={(e) => setRoute(e.target.value)} />
        </Col>
        <Col span={6}>
          <Text>&nbsp;</Text>
          <Space style={{ marginTop: 20 }}>
            <Button type='primary' onClick={handleFilter}>
              Filter
            </Button>
            <Button onClick={handleReset}>Reset</Button>
          </Space>
        </Col>
      </Row>

      <Row justify='start' gutter={8} style={{ marginBottom: 16, marginTop: 16 }}>
        <Col>
          <Button variant='outlined' color='primary' onClick={() => handleExport('csv')}>
            Export CSV
          </Button>
        </Col>
        <Col>
          <Button variant='solid' color='default' onClick={() => handleExport('excel')}>
            Export Excel
          </Button>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey={(record, index) => `${record.date}-${record.merchant_name}-${index}`}
          pagination={{ pageSize: 20 }}
        />
      </Spin>
    </div>
  )
}

export default TransactionSummaryPage
