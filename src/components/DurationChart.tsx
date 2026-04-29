import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Card, Select, Spin, Empty, DatePicker, Tag, Space } from 'antd'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import axios from 'axios'
import dayjs from 'dayjs'
import { useAuth } from '../provider/AuthProvider'
import { parseDurationToSeconds, formatSecondsToDuration } from '../utils/durationParser'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const { RangePicker } = DatePicker

// === Types ===
interface DurationDataPoint {
  date: string
  merchant_name: string
  payment_method: string
  status: string
  avg_supplier_duration: string
  avg_merchant_duration: string
  avg_total_duration: string
  total_transactions: number
}

interface ParsedDataPoint extends DurationDataPoint {
  supplierSeconds: number
  merchantSeconds: number
  totalSeconds: number
  dateFormatted: string
}

// Auto-refresh interval (10 minutes = API cache TTL)
const AUTO_REFRESH_INTERVAL = 10 * 60 * 1000

const DurationChart: React.FC = () => {
  const { token, apiUrl } = useAuth()

  // === State ===
  const [rawData, setRawData] = useState<DurationDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  // Date range (default: today)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('day'),
    dayjs().endOf('day'),
  ])

  // === Fetch Data ===
  const fetchDurationData = useCallback(async () => {
    if (!token || !apiUrl) return
    try {
      setLoading(true)
      setError(null)

      const startDate = dateRange[0].format('YYYY-MM-DD')
      const endDate = dateRange[1].format('YYYY-MM-DD')

      const url = `${apiUrl}/traffic/monitoring/duration`
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: { start_date: startDate, end_date: endDate },
      })

      const data: DurationDataPoint[] = res.data?.data || []
      setRawData(data)
    } catch (e: any) {
      console.error('Duration monitoring fetch error:', e)
      setError('Failed to load duration monitoring data')
    } finally {
      setLoading(false)
    }
  }, [apiUrl, token, dateRange])

  // Initial fetch + auto-refresh
  useEffect(() => {
    fetchDurationData()
    const interval = setInterval(fetchDurationData, AUTO_REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchDurationData])

  // === Parse + Filter Data ===
  const parsedData: ParsedDataPoint[] = useMemo(() => {
    return rawData.map((d) => ({
      ...d,
      supplierSeconds: parseDurationToSeconds(d.avg_supplier_duration),
      merchantSeconds: parseDurationToSeconds(d.avg_merchant_duration),
      totalSeconds: parseDurationToSeconds(d.avg_total_duration),
      dateFormatted: dayjs(d.date).format('HH:mm'),
    }))
  }, [rawData])

  // Unique filter options
  const merchants = useMemo(() => {
    const set = new Set(parsedData.map((d) => d.merchant_name))
    return Array.from(set).sort()
  }, [parsedData])

  const paymentMethods = useMemo(() => {
    const set = new Set(parsedData.map((d) => d.payment_method))
    return Array.from(set).sort()
  }, [parsedData])

  const statuses = useMemo(() => {
    const set = new Set(parsedData.map((d) => d.status))
    return Array.from(set).sort()
  }, [parsedData])

  // Filtered data
  const filteredData = useMemo(() => {
    return parsedData.filter((d) => {
      if (selectedMerchant !== 'all' && d.merchant_name !== selectedMerchant) return false
      if (selectedPaymentMethod !== 'all' && d.payment_method !== selectedPaymentMethod) return false
      if (selectedStatus !== 'all' && d.status !== selectedStatus) return false
      return true
    })
  }, [parsedData, selectedMerchant, selectedPaymentMethod, selectedStatus])

  // === Chart Data ===
  const chartData = useMemo(() => {
    const labels = filteredData.map((d) => d.dateFormatted)

    return {
      labels,
      datasets: [
        {
          label: 'Avg Total Duration',
          data: filteredData.map((d) => d.totalSeconds),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          tension: 0.4,
          fill: true,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 7,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#6366f1',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
        },
        {
          label: 'Avg Supplier Duration',
          data: filteredData.map((d) => d.supplierSeconds),
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.06)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: '#f59e0b',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#f59e0b',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
        },
        {
          label: 'Avg Merchant Duration',
          data: filteredData.map((d) => d.merchantSeconds),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.06)',
          tension: 0.4,
          fill: true,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBackgroundColor: '#10b981',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
        },
      ],
    }
  }, [filteredData])

  // === Chart Options ===
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20,
            font: { size: 13, weight: 500 as const },
          },
        },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#e2e8f0',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          borderWidth: 1,
          cornerRadius: 12,
          padding: 14,
          titleFont: { size: 13, weight: 600 as const },
          bodyFont: { size: 12 },
          bodySpacing: 6,
          callbacks: {
            title: (items: any[]) => {
              if (!items || !items[0]) return ''
              const idx = items[0].dataIndex
              const point = filteredData[idx]
              if (!point) return ''
              return `${dayjs(point.date).format('ddd, DD MMM YYYY HH:mm')}`
            },
            afterTitle: (items: any[]) => {
              const idx = items[0]?.dataIndex
              const point = filteredData[idx]
              if (!point) return ''
              return `${point.merchant_name} • ${point.payment_method.toUpperCase()}`
            },
            label: (item: any) => {
              const idx = item.dataIndex
              const point = filteredData[idx]
              if (!point) return ''

              const labels: Record<string, string> = {
                'Avg Total Duration': point.avg_total_duration,
                'Avg Supplier Duration': point.avg_supplier_duration,
                'Avg Merchant Duration': point.avg_merchant_duration,
              }
              return `  ${item.dataset.label}: ${labels[item.dataset.label] || formatSecondsToDuration(item.raw)}`
            },
            afterBody: (items: any[]) => {
              const idx = items[0]?.dataIndex
              const point = filteredData[idx]
              if (!point) return ''
              return `\n  📦 Total Transactions: ${point.total_transactions}`
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(148, 163, 184, 0.08)',
            drawBorder: false,
          },
          border: { display: false },
          ticks: {
            padding: 12,
            font: { size: 12 },
            color: '#94a3b8',
            callback: function (value: any) {
              return formatSecondsToDuration(Number(value))
            },
          },
          title: {
            display: true,
            text: 'Duration (seconds)',
            font: { size: 12, weight: 500 as const },
            color: '#94a3b8',
            padding: { bottom: 8 },
          },
        },
        x: {
          grid: {
            color: 'rgba(148, 163, 184, 0.06)',
            drawBorder: false,
          },
          border: { display: false },
          ticks: {
            padding: 10,
            maxTicksLimit: 12,
            font: { size: 12 },
            color: '#94a3b8',
            maxRotation: 45,
            minRotation: 0,
          },
          title: {
            display: true,
            text: 'Time (per 10 minutes)',
            font: { size: 12, weight: 500 as const },
            color: '#94a3b8',
            padding: { top: 8 },
          },
        },
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      animation: {
        duration: 800,
        easing: 'easeOutQuart' as const,
      },
    }),
    [filteredData],
  )

  // === Stats Summary ===
  const stats = useMemo(() => {
    if (filteredData.length === 0) return null

    const totalDurations = filteredData.map((d) => d.totalSeconds)
    const avgTotal = totalDurations.reduce((a, b) => a + b, 0) / totalDurations.length
    const maxTotal = Math.max(...totalDurations)
    const minTotal = Math.min(...totalDurations)
    const totalTrx = filteredData.reduce((sum, d) => sum + d.total_transactions, 0)

    return {
      avgTotal: formatSecondsToDuration(Math.round(avgTotal)),
      maxTotal: formatSecondsToDuration(maxTotal),
      minTotal: formatSecondsToDuration(minTotal),
      totalTransactions: totalTrx,
      dataPoints: filteredData.length,
    }
  }, [filteredData])

  // === Render ===
  return (
    <div style={{ width: '100%' }}>
      <Card
        style={{
          borderRadius: 16,
          border: '1px solid rgba(148, 163, 184, 0.12)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)',
        }}
        bodyStyle={{ padding: '24px' }}
      >
        {/* Title + Filters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.3px',
              }}
            >
              ⏱️ Transaction Duration Monitoring
            </h2>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 13 }}>
              Average transaction completion duration (per 10 minutes)
              <Tag
                color='blue'
                style={{ marginLeft: 8, fontSize: 11 }}
              >
                Auto-refresh 10 min
              </Tag>
            </p>
          </div>

          <div>
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange([dates[0], dates[1]])
                }
              }}
              format='YYYY-MM-DD'
              style={{ minWidth: 260 }}
            />
          </div>
        </div>

        {/* Filters Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
            padding: '16px',
            background: 'rgba(148, 163, 184, 0.04)',
            borderRadius: 12,
            border: '1px solid rgba(148, 163, 184, 0.08)',
          }}
        >
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Merchant
            </label>
            <Select
              value={selectedMerchant}
              onChange={setSelectedMerchant}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'All Merchants' },
                ...merchants.map((m) => ({ value: m, label: m })),
              ]}
            />
          </div>

          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Payment Method
            </label>
            <Select
              value={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'All Payment Methods' },
                ...paymentMethods.map((m) => ({ value: m, label: m.toUpperCase() })),
              ]}
            />
          </div>

          <div style={{ flex: '1 1 150px' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
              Status
            </label>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
              options={[
                { value: 'all', label: 'All Status' },
                ...statuses.map((s) => ({
                  value: s,
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                })),
              ]}
            />
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))',
                border: '1px solid rgba(99,102,241,0.15)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Avg Duration
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#4f46e5', marginTop: 4 }}>
                {stats.avgTotal}
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(244,63,94,0.06))',
                border: '1px solid rgba(239,68,68,0.15)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Max Duration
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', marginTop: 4 }}>
                {stats.maxTotal}
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.06))',
                border: '1px solid rgba(16,185,129,0.15)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Min Duration
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#059669', marginTop: 4 }}>
                {stats.minTotal}
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,88,12,0.06))',
                border: '1px solid rgba(245,158,11,0.15)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Transactions
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#d97706', marginTop: 4 }}>
                {stats.totalTransactions.toLocaleString()}
              </div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(148,163,184,0.08), rgba(100,116,139,0.06))',
                border: '1px solid rgba(148,163,184,0.15)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Data Points
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#475569', marginTop: 4 }}>
                {stats.dataPoints}
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div
          style={{
            position: 'relative',
            height: 420,
            padding: '8px 0',
          }}
        >
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: 12,
                zIndex: 10,
              }}
            >
              <Space direction='vertical' align='center'>
                <Spin size='large' />
                <span style={{ color: '#64748b', fontSize: 13 }}>Loading duration data...</span>
              </Space>
            </div>
          )}

          {error && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <Empty description={<span style={{ color: '#ef4444' }}>{error}</span>} />
            </div>
          )}

          {!loading && !error && filteredData.length === 0 && (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Empty description='No data available for the selected filters' />
            </div>
          )}

          {!loading && !error && filteredData.length > 0 && (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>
      </Card>
    </div>
  )
}

export default DurationChart
