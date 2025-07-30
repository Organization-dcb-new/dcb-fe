import { useState, useEffect } from 'react'
import axios from 'axios'
import { message, DatePicker } from 'antd'
import dayjs from 'dayjs'

import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Select from '@mui/material/Select'
import { CancelOutlined, CheckCircleOutlined, RemoveCircleOutline } from '@mui/icons-material'
import Chart from './Chart'
import { useAuth } from '../provider/AuthProvider'
import { useClient } from '../context/ClientContext'

interface TransactionSummary {
  success: number
  failed: number
  pending: number
  total: number
  revenue: number
}

interface ChartData {
  datetime: number
  success: number
  canceled: number
  failed: number
  [key: string]: number
}

type Status = 'success' | 'failed' | 'pending'
interface Props {
  status: Status
  value: number | undefined
  previousValue?: number
}

const getStatus = (status: Status) => {
  switch (status) {
    case 'failed':
      return {
        label: 'Failed',
        variant: {
          background: 'bg-red-700',
          border: 'border-red-700',
        },
        icon: <CancelOutlined className='size-10 lg:size-[72px]' />,
      }
    case 'success':
      return {
        label: 'Success',
        variant: { background: 'bg-teal-500', border: 'border-teal-500' },
        icon: <CheckCircleOutlined className='size-10 lg:size-[72px]' />,
      }
    case 'pending':
      return {
        label: 'Pending',
        variant: {
          background: 'bg-yellow-500',
          border: 'border-yellow-500',
        },
        icon: <RemoveCircleOutline className='size-10 lg:size-[72px]' />,
      }
  }
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

const SummaryCard = ({ status, value, previousValue }: Props) => {
  const { label, variant, icon } = getStatus(status)

  const getChangeSummary = (current?: number, previous?: number, status?: string) => {
    if (current === undefined || previous === undefined) return null

    const diff = current - previous
    const percent = previous === 0 ? 100 : (diff / previous) * 100

    // Untuk status yang memburuk saat naik (Pending dan Failed)
    const reversed = status === 'pending' || status === 'failed'

    const isPositive = diff >= 0
    const isGoodChange = reversed ? !isPositive : isPositive // pembalikannya di sini

    return {
      diff,
      percent: Math.abs(parseFloat(percent.toFixed(1))),
      isPositive,
      isGoodChange, // yang menentukan warna/icon
    }
  }

  return (
    <Card variant='outlined' className={`flex-1 ${variant.border}`}>
      <>
        <CardContent className={variant.background}>
          <div className='flex justify-between items-center text-white '>
            {icon}
            <div className='flex flex-col items-end'>
              <Typography variant='h2' component='div'>
                {value === undefined ? <Skeleton width={100} /> : formatNumber(value)}
              </Typography>
              <Typography variant='h5'>{label}</Typography>
            </div>
          </div>
        </CardContent>
        <CardActions>
          {/* <Button sx={{ lineHeight: '14px' }} size='small' variant='text' endIcon={<ChevronRight />}>
            View Detail
          </Button> */}

          {value !== undefined && previousValue !== undefined ? (
            (() => {
              const change = getChangeSummary(value, previousValue, status)
              if (!change) return null

              const color = change.isGoodChange ? 'text-green-600' : 'text-red-600'

              return (
                <div className={`flex items-center gap-1 mt-2 text-sm ${color}`}>
                  <span className='text-xl font-bold'>
                    {change.isPositive ? '+' : '-'}
                    {formatNumber(Math.abs(change.diff))} ({change.isPositive ? '+' : '-'}
                    {change.percent}%)
                  </span>
                </div>
              )
            })()
          ) : (
            <Skeleton width={80} height={20} />
          )}
        </CardActions>
      </>
    </Card>
  )
}

const SummaryMerchant = () => {
  // Filter untuk summary cards
  const [summaryFreq, setSummaryFreq] = useState('daily')
  const [summaryPaymentMethod, setSummaryPaymentMethod] = useState('all')
  const [summaryDate, setSummaryDate] = useState<dayjs.Dayjs | null>(null)
  const { client } = useClient()

  const [chartData, setChartData] = useState<ChartData[]>([])
  const [summaryData, setSummaryData] = useState<TransactionSummary>({
    success: 0,
    failed: 0,
    pending: 0,
    total: 0,
    revenue: 0,
  })
  const [previousSummaryData, setPreviousSummaryData] = useState<TransactionSummary>({
    success: 0,
    failed: 0,
    pending: 0,
    total: 0,
    revenue: 0,
  })
  const { apiUrl, token, appId, appKey } = useAuth()

  const getDateRange = (frequency: string, customDate?: dayjs.Dayjs | null) => {
    // Jika ada custom date, gunakan itu
    if (customDate) {
      const selectedDate = customDate
      const previousDate = selectedDate.subtract(1, 'day')

      return {
        current: {
          start_date: selectedDate.format('YYYY-MM-DD'),
          end_date: selectedDate.format('YYYY-MM-DD'),
        },
        previous: {
          start_date: previousDate.format('YYYY-MM-DD'),
          end_date: previousDate.format('YYYY-MM-DD'),
        },
      }
    }

    const now = dayjs()

    if (frequency === 'daily') {
      // Hari ini
      const today = now.startOf('day')
      const yesterday = now.subtract(1, 'day').startOf('day')

      return {
        current: {
          start_date: today.format('YYYY-MM-DD'),
          end_date: today.format('YYYY-MM-DD'), // Untuk daily, start dan end sama
        },
        previous: {
          start_date: yesterday.format('YYYY-MM-DD'),
          end_date: yesterday.format('YYYY-MM-DD'), // Untuk daily, start dan end sama
        },
      }
    } else {
      // Monthly - Month to date vs bulan lalu
      const monthStart = now.startOf('month')
      const previousMonth = now.subtract(1, 'month')
      const previousMonthStart = previousMonth.startOf('month')
      const previousMonthEnd = previousMonth.endOf('month')

      return {
        current: {
          start_date: monthStart.format('YYYY-MM-DD'),
          end_date: now.format('YYYY-MM-DD'), // Month to date
        },
        previous: {
          start_date: previousMonthStart.format('YYYY-MM-DD'),
          end_date: previousMonthEnd.format('YYYY-MM-DD'), // Full previous month
        },
      }
    }
  }

  const fetchSummary = async () => {
    try {
      const dateRangeConfig = getDateRange(summaryFreq, summaryDate)

      // Fetch current period data
      const currentStartDate = dayjs(dateRangeConfig.current.start_date).utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]')
      const currentEndDate = dayjs(dateRangeConfig.current.end_date)
        .add(1, 'day')
        .utc()
        .subtract(7, 'hour')
        .subtract(1, 'second')
        .add(7, 'hour')
        .format('ddd, DD MMM YYYY HH:mm:ss [GMT]')

      // console.log('Current period:', {
      //   start: dateRangeConfig.current.start_date,
      //   end: dateRangeConfig.current.end_date,
      //   startFormatted: currentStartDate,
      //   endFormatted: currentEndDate,
      //   frequency: freq,
      // })

      const currentParams = {
        start_date: currentStartDate,
        end_date: currentEndDate,
        payment_method: summaryPaymentMethod === 'all' ? undefined : summaryPaymentMethod,
        limit: 10000, // Get all data for summary
      }

      const currentRes = await axios.get(`${apiUrl}/merchant/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          appkey: appKey,
          appid: appId,
        },
        params: currentParams,
      })

      // Fetch previous period data for comparison
      const previousStartDate = dayjs(dateRangeConfig.previous.start_date)
        .utc()
        .format('ddd, DD MMM YYYY HH:mm:ss [GMT]')
      const previousEndDate = dayjs(dateRangeConfig.previous.end_date)
        .add(1, 'day')
        .utc()
        .subtract(7, 'hour')
        .subtract(1, 'second')
        .add(7, 'hour')
        .format('ddd, DD MMM YYYY HH:mm:ss [GMT]')

      // console.log('Previous period:', {
      //   start: dateRangeConfig.previous.start_date,
      //   end: dateRangeConfig.previous.end_date,
      //   startFormatted: previousStartDate,
      //   endFormatted: previousEndDate,
      //   frequency: freq,
      // })

      const previousParams = {
        start_date: previousStartDate,
        end_date: previousEndDate,
        payment_method: summaryPaymentMethod === 'all' ? undefined : summaryPaymentMethod,
        limit: 10000, // Get all data for summary
      }

      const previousRes = await axios.get(`${apiUrl}/merchant/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          appkey: appKey,
          appid: appId,
        },
        params: previousParams,
      })

      // Process current data
      const currentData = currentRes.data.data || []
      const currentSummary = {
        success: currentData.filter((item: any) => item.status_code === 1000).length,
        failed: currentData.filter((item: any) => item.status_code === 1005).length,
        pending: currentData.filter((item: any) => item.status_code === 1001 || item.status_code === 1003).length,
        total: currentData.length,
        revenue: currentData.reduce((sum: number, item: any) => {
          return item.status_code === 1000 ? sum + (item.amount || 0) : sum
        }, 0),
      }

      // Process previous data
      const previousData = previousRes.data.data || []
      const previousSummary = {
        success: previousData.filter((item: any) => item.status_code === 1000).length,
        failed: previousData.filter((item: any) => item.status_code === 1005).length,
        pending: previousData.filter((item: any) => item.status_code === 1001 || item.status_code === 1003).length,
        total: previousData.length,
        revenue: previousData.reduce((sum: number, item: any) => {
          return item.status_code === 1000 ? sum + (item.amount || 0) : sum
        }, 0),
      }

      setSummaryData(currentSummary)
      setPreviousSummaryData(previousSummary)
    } catch (error) {
      message.error('Failed to fetch summary data')
      console.error(error)
    } finally {
      // setLoading(false)
    }
  }

  const fetchChartData = async () => {
    try {
      // Chart menggunakan filter yang sama dengan summary
      const dateRangeConfig = getDateRange(summaryFreq, summaryDate)

      const chartStartDate = dayjs(dateRangeConfig.current.start_date).utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]')
      const chartEndDate = dayjs(dateRangeConfig.current.end_date)
        .add(1, 'day')
        .utc()
        .subtract(7, 'hour')
        .subtract(1, 'second')
        .add(7, 'hour')
        .format('ddd, DD MMM YYYY HH:mm:ss [GMT]')

      const chartParams = {
        start_date: chartStartDate,
        end_date: chartEndDate,
        merchant: client?.client_name,
        payment_method: summaryPaymentMethod === 'all' ? undefined : summaryPaymentMethod,
      }

      const chartRes = await axios.get(`${apiUrl}/summary/transaction`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          appkey: appKey,
          appid: appId,
        },
        params: chartParams,
      })

      const chartDataFromAPI = chartRes.data.data || []

      // Transform API data to chart format
      // Group by date and aggregate by status
      const groupedByDate = chartDataFromAPI.reduce((acc: any, item: any) => {
        const date = item.date
        if (!acc[date]) {
          acc[date] = { success: 0, canceled: 0, failed: 0 }
        }

        // Count by status
        if (item.status === 'success') {
          acc[date].success += item.total || 0
        } else if (item.status === 'pending') {
          acc[date].canceled += item.total || 0
        } else if (item.status === 'failed') {
          acc[date].failed += item.total || 0
        }

        return acc
      }, {})

      const chartDataArray = Object.entries(groupedByDate).map(([date, data]: [string, any]) => ({
        datetime: dayjs(date).unix(),
        success: data.success,
        canceled: data.canceled,
        failed: data.failed,
      }))

      setChartData(chartDataArray)
    } catch (error) {
      message.error('Failed to fetch chart data')
      console.error(error)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [summaryFreq, summaryPaymentMethod, summaryDate])

  useEffect(() => {
    fetchChartData()
  }, [summaryFreq, summaryPaymentMethod, summaryDate]) // Chart data mengikuti filter summary

  return (
    <div className='space-y-4 w-full'>
      <div className='flex gap-4 items-end justify-between'>
        <Typography variant='h2' fontWeight='bold' fontSize={24}>
          Summary
        </Typography>
        <div className='flex gap-4 items-start justify-between'>
          <div className='flex flex-col'>
            <Typography variant='body2' className='text-lg mb-1'>
              Payment Method
            </Typography>
            <Select
              sx={{ width: '160px', padding: '8px 12px', height: '40px', borderRadius: 1 }}
              labelId='summaryPaymentMethod'
              id='summaryPaymentMethod'
              value={summaryPaymentMethod}
              onChange={(event) => setSummaryPaymentMethod(event.target.value)}
            >
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='ovo'>OVO</MenuItem>
              <MenuItem value='qris'>Qris</MenuItem>
              <MenuItem value='pulsa'>Pulsa</MenuItem>
            </Select>
          </div>
          <div className='flex flex-col'>
            <Typography variant='body2' className='text-lg mb-1'>
              Frequency
            </Typography>
            <Select
              sx={{ width: '160px', padding: '8px 12px', height: '40px', borderRadius: 1 }}
              labelId='summaryFrequency'
              id='summaryFrequency'
              value={summaryFreq}
              onChange={(event) => setSummaryFreq(event.target.value)}
              disabled={summaryDate !== null}
            >
              <MenuItem value='daily'>Daily</MenuItem>
              <MenuItem value='monthly'>Monthly</MenuItem>
            </Select>
          </div>
          <div className='flex flex-col'>
            <Typography variant='body2' className='text-lg mb-1'>
              Custom Date
            </Typography>
            <DatePicker
              value={summaryDate}
              onChange={(date) => setSummaryDate(date)}
              format='YYYY-MM-DD'
              placeholder='Select Date'
              style={{ width: '160px', height: '40px' }}
            />
          </div>
        </div>
      </div>

      <div className='flex gap-4 justify-between w-full overflow-auto !mb-16'>
        <SummaryCard status='success' value={summaryData.success} previousValue={previousSummaryData.success} />
        <SummaryCard status='pending' value={summaryData.pending} previousValue={previousSummaryData.pending} />
        <SummaryCard status='failed' value={summaryData.failed} previousValue={previousSummaryData.failed} />
        <Card variant='outlined' className='flex-1'>
          <CardContent className='flex flex-col gap-4 !p-4'>
            <div>
              <Typography component='h2' variant='subtitle2'>
                Total Transactions
              </Typography>
              <Typography variant='h4' component='span'>
                {formatNumber(summaryData.total)}
              </Typography>
            </div>
            <div>
              <Typography component='h2' variant='subtitle2'>
                Total Gross Revenue
              </Typography>
              <Typography variant='h4' component='span'>
                Rp {formatNumber(summaryData.revenue)}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>

      <Chart data={chartData} title={`${summaryFreq === 'daily' ? 'Daily' : 'Monthly'} Transaction Summary`} />
    </div>
  )
}

export default SummaryMerchant
