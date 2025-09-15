import React, { useEffect, useMemo, useState } from 'react'
import { Table, DatePicker, Row, Col, Button, message, Typography as AntTypography } from 'antd'
import type { TableColumnsType } from 'antd'
import axios from 'axios'
import dayjs, { Dayjs } from 'dayjs'
import { useAuth } from '../provider/AuthProvider'
import formatRupiah from '../utils/FormatRupiah'

// using DatePicker with picker='month'
const { Title } = AntTypography

interface MarginSummaryItem {
  merchant_name: string
  payment_method: string
  client_uid: string
  route: string
  fee: number
  count: number
  total_amount: number
  total_amount_tax: number
  share_redision: number
  share_merchant: number
  margin: number
  share_supplier: number
  share_supplier_inc: number
  bhp_uso_supplier: number
  pph_supplier: number
  share_supplier_nett: number
  share_merchant_percentage: number
  share_redision_percentage: number
}

interface MarginResponse {
  calculation_formula: string
  share_redision_formula: string
  summaries: MarginSummaryItem[]
  total_amount?: number
  total_margin?: number
}

type GroupedRow = {
  key: string
  client_uid: string
  merchant_name: string
  total_count: number
  total_amount: number
  total_margin: number
  details: MarginSummaryItem[]
}

const childColumns: TableColumnsType<MarginSummaryItem> = [
  { title: 'Payment Method', dataIndex: 'payment_method', key: 'payment_method', width: 200 },
  { title: '#Trx', dataIndex: 'count', key: 'count', width: 100, align: 'right' },
  {
    title: 'Sales EXC',
    dataIndex: 'total_amount',
    key: 'total_amount',
    align: 'right',
    width: 180,
    render: (v: number) => formatRupiah(v || 0),
  },
  {
    title: 'Fee Channel %',
    dataIndex: 'fee',
    key: 'fee',
    align: 'right',
    width: 90,
  },
  {
    title: 'Share Chanel EXC',
    dataIndex: 'share_supplier',
    key: 'share_supplier',
    align: 'right',
    width: 180,
    render: (v: number) => formatRupiah(v || 0),
  },
  {
    title: 'Share Chanel INC',
    dataIndex: 'share_supplier_inc',
    key: 'share_supplier_inc',
    align: 'right',
    width: 180,
    render: (v: number) => formatRupiah(v || 0),
  },
  {
    title: 'Redision Share',
    dataIndex: 'share_redision',
    key: 'share_redision',
    align: 'right',
    width: 180,
    render: (v: number) => formatRupiah(v || 0),
  },
  {
    title: 'Merchant Share',
    dataIndex: 'share_merchant',
    key: 'share_merchant',
    align: 'right',
    width: 180,
    render: (v: number) => formatRupiah(v || 0),
  },
  {
    title: 'Fee Merchant %',
    dataIndex: 'share_redision_percentage',
    key: 'share_redision_percentage',
    align: 'right',
    width: 90,
  },
  {
    title: 'Margin',
    dataIndex: 'margin',
    key: 'margin',
    align: 'right',
    width: 180,
    render: (v: number) => <span className={v < 0 ? 'text-red-600' : 'text-emerald-600'}>{formatRupiah(v || 0)}</span>,
  },
]

const parentColumns: TableColumnsType<GroupedRow> = [
  {
    title: 'Merchant',
    dataIndex: 'merchant_name',
    key: 'merchant_name',
    width: 420,
    ellipsis: true,
    render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
  },
  { title: '#Trx', dataIndex: 'total_count', key: 'total_count', width: 120, align: 'right' },
  {
    title: 'Total Sales',
    dataIndex: 'total_amount',
    key: 'total_amount',
    align: 'right',
    width: 220,
    render: (v: number) => formatRupiah(v || 0),
  },
  {
    title: 'Total Margin',
    dataIndex: 'total_margin',
    key: 'total_margin',
    align: 'right',
    width: 200,
    render: (v: number) => <span className={v < 0 ? 'text-red-600' : 'text-emerald-700'}>{formatRupiah(v || 0)}</span>,
  },
]

const ReportMargin: React.FC = () => {
  const { apiUrl } = useAuth()
  const [loading, setLoading] = useState(false)
  const [month, setMonth] = useState<Dayjs>(dayjs())
  const [raw, setRaw] = useState<MarginResponse | null>(null)

  const groupedData: GroupedRow[] = useMemo(() => {
    if (!raw?.summaries?.length) return []
    const map = new Map<string, GroupedRow>()
    for (const item of raw.summaries) {
      const key = item.client_uid || item.merchant_name
      if (!map.has(key)) {
        map.set(key, {
          key,
          client_uid: item.client_uid,
          merchant_name: item.merchant_name,
          total_count: 0,
          total_amount: 0,
          total_margin: 0,
          details: [],
        })
      }
      const agg = map.get(key)!
      agg.total_count += item.count || 0
      agg.total_amount += item.total_amount || 0
      agg.total_margin += item.margin || 0
      agg.details.push(item)
    }
    return Array.from(map.values())
  }, [raw])

  const totals = useMemo(() => {
    if (!groupedData.length) return { amount: 0, margin: 0, count: 0 }
    return groupedData.reduce(
      (acc, r) => {
        acc.amount += r.total_amount
        acc.margin += r.total_margin
        acc.count += r.total_count
        return acc
      },
      { amount: 0, margin: 0, count: 0 },
    )
  }, [groupedData])

  const fetchData = async () => {
    if (!month) return
    const start = month.startOf('month')
    const end = month.endOf('month')
    const start_date = encodeURIComponent(start.utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]'))
    const end_date = encodeURIComponent(end.utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]'))
    setLoading(true)
    try {
      const res = await axios.get(`${apiUrl}/report/merchant/margin?start_date=${start_date}&end_date=${end_date}`)
      setRaw(res.data)
    } catch (e) {
      console.error(e)
      message.error('Gagal mengambil data report margin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='flex flex-col p-6'>
      <style>{`
        /* Parent table header */
        .report-margin-table.parent .ant-table-thead > tr > th {
          background-color: #0ea5e9; /* sky-500 */
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
        }
        /* Child table header */
        .report-margin-table.child .ant-table-thead > tr > th {
          background-color: #e0f2fe; /* sky-100 */
          color: #0369a1; /* sky-700 */
          font-size: 14px;
          font-weight: 600;
        }
        /* Hover */
        .report-margin-table .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc; /* slate-50 */
        }
        /* Summary row */
        .report-margin-table .ant-table-summary {
          background-color: #f1f5f9; /* slate-100 */
        }
        /* Body text size */
        .report-margin-table.parent .ant-table-tbody > tr > td {
          font-size: 14px;
          padding: 10px 12px;
        }
        .report-margin-table.child .ant-table-tbody > tr > td {
          font-size: 14px;
          padding: 8px 12px;
        }
        .report-margin-table .ant-table-thead > tr > th {
          padding: 10px 12px;
        }
      `}</style>
      <Title level={4} style={{ marginBottom: 16 }}>
        Report Margin
      </Title>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col>
          <DatePicker
            picker='month'
            value={month as any}
            onChange={(v) => v && setMonth(v as any)}
            allowClear={false}
          />
        </Col>
        <Col>
          <Button type='primary' onClick={fetchData} loading={loading}>
            Load
          </Button>
        </Col>
      </Row>

      <Table<GroupedRow>
        bordered
        loading={loading}
        columns={parentColumns}
        dataSource={groupedData}
        pagination={false}
        sticky
        tableLayout='fixed'
        scroll={{ x: true }}
        rowClassName={(_, index) => (index % 2 === 0 ? 'odd' : 'even')}
        expandable={{
          expandedRowRender: (record) => (
            <Table<MarginSummaryItem>
              size='small'
              columns={childColumns}
              dataSource={record.details}
              pagination={false}
              rowKey={(r) => `${record.client_uid}-${r.payment_method}`}
              bordered
              tableLayout='fixed'
              scroll={{ x: true }}
              className='report-margin-table child mt-3 mb-3'
            />
          ),
          expandIcon: ({ expanded, onExpand, record }) => (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <Button type='link' onClick={(e) => onExpand(record as any, e)}>
                {`Detail ${expanded ? 'v' : '>'}`}
              </Button>
            </div>
          ),
          expandRowByClick: false,
        }}
        rowKey={(r) => r.key}
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2}>
                <strong>Total</strong>
              </Table.Summary.Cell>

              <Table.Summary.Cell index={1} align='right'>
                <strong>{totals.count.toLocaleString('id-ID')}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} align='right'>
                <strong>{formatRupiah(raw?.total_amount ?? totals.amount)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3} align='right'>
                <strong>{formatRupiah(raw?.total_margin ?? totals.margin)}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
        className='report-margin-table parent bg-white rounded-lg shadow'
      />
    </div>
  )
}

export default ReportMargin
