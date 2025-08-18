import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import dayjs from 'dayjs'
import { Box, Typography as MuiTypography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Card, Tag, Row, Col, Descriptions, Button, Skeleton, Space, Divider, Typography, Table, Tooltip } from 'antd'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  AppstoreOutlined,
  LinkOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  KeyOutlined,
  SettingOutlined,
  CopyOutlined,
} from '@ant-design/icons'

import { useAuth } from '../../provider/AuthProvider'

const useMerchantDetail = (id?: string) => {
  const [data, setData] = useState<MerchantListDataApi | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const { token, apiUrl } = useAuth()

  useEffect(() => {
    const getMerchantDetail = async () => {
      try {
        const response = await axios.get<{ data: MerchantListDataApi }>(`${apiUrl}/admin/merchant/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        setData(response?.data?.data ?? null)
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          setError(error.response.data?.message || '')
        } else {
          setError('An unexpected error occurred')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      getMerchantDetail()
    }
  }, [id])

  return { isLoading, error, merchantDetail: data }
}

const DetailMerchant = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { merchantDetail, isLoading } = useMerchantDetail(id)
  const { role } = useAuth()

  const [showClientSecret, setShowClientSecret] = useState(false)
  const [visibleAppKeys, setVisibleAppKeys] = useState<Record<number, boolean>>({})

  const isSuperAdmin = role === 'superadmin'

  const getStatusColor = (status: string | number) => {
    return status === 1 || status === '1' ? 'green' : 'red'
  }

  const getStatusText = (status: string | number) => {
    return status === 1 || status === '1' ? 'Aktif' : 'Tidak Aktif'
  }

  const toggleAppKeyVisibility = (appId: number) => {
    setVisibleAppKeys((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const maskSensitiveData = (data: string, visible: boolean) => {
    if (!data) return '-'
    if (visible || !isSuperAdmin) return data
    return '••••••••••••••••'
  }

  const renderSensitiveField = (value: string, visible: boolean, onToggle: () => void) => {
    if (!isSuperAdmin) {
      return <Typography.Text type='secondary'>Hidden</Typography.Text>
    }

    return (
      <Space>
        <code
          style={{
            padding: '2px 6px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '12px',
            minWidth: '150px',
            display: 'inline-block',
          }}
        >
          {maskSensitiveData(value, visible)}
        </code>
        <Button
          type='text'
          size='small'
          icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
          onClick={onToggle}
        />
        {visible && <Button type='text' size='small' icon={<CopyOutlined />} onClick={() => copyToClipboard(value)} />}
      </Space>
    )
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
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <Space size='large' align='center'>
            <Button
              type='text'
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ padding: '4px 8px' }}
            >
              Kembali
            </Button>
            <MuiTypography variant='h4' component='h1' style={{ margin: 0, fontWeight: 600 }}>
              Detail Merchant
            </MuiTypography>
          </Space>
        </div>

        {/* Content */}
        <Row gutter={[24, 24]}>
          {/* Main Information */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <IdcardOutlined />
                  <span>Informasi Merchant</span>
                </Space>
              }
              loading={isLoading}
            >
              {merchantDetail ? (
                <Descriptions column={1} labelStyle={{ fontWeight: 600, width: '200px' }}>
                  <Descriptions.Item label='Merchant Name'>{merchantDetail.client_name || '-'}</Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <PhoneOutlined />
                        <span>Phone</span>
                      </Space>
                    }
                  >
                    {merchantDetail.phone || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <MailOutlined />
                        <span>Email</span>
                      </Space>
                    }
                  >
                    {merchantDetail.email || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label='Address'>{merchantDetail.address || '-'}</Descriptions.Item>
                  <Descriptions.Item label='UID'>
                    <code
                      style={{ padding: '2px 6px', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '12px' }}
                    >
                      {merchantDetail.u_id || '-'}
                    </code>
                  </Descriptions.Item>
                  <Descriptions.Item label='Status'>
                    <Tag color={getStatusColor(merchantDetail.client_status)}>
                      {getStatusText(merchantDetail.client_status)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <KeyOutlined />
                        <span>Client Secret</span>
                      </Space>
                    }
                  >
                    {renderSensitiveField(merchantDetail.client_secret, showClientSecret, () =>
                      setShowClientSecret(!showClientSecret),
                    )}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Skeleton active paragraph={{ rows: 5 }} />
              )}
            </Card>

            {/* Application Info */}
            <Card
              title={
                <Space>
                  <AppstoreOutlined />
                  <span>Informasi Aplikasi</span>
                </Space>
              }
              style={{ marginTop: '24px' }}
              loading={isLoading}
            >
              {merchantDetail ? (
                <Descriptions column={1} labelStyle={{ fontWeight: 600, width: '200px' }}>
                  <Descriptions.Item label='Application Name'>{merchantDetail.app_name || '-'}</Descriptions.Item>
                  <Descriptions.Item label='Application Type'>
                    <Tag color='blue'>{merchantDetail.mobile ? 'Mobile App' : 'Web App'}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item
                    label={
                      <Space>
                        <LinkOutlined />
                        <span>Callback URL</span>
                      </Space>
                    }
                  >
                    {merchantDetail.callback_url ? (
                      <a href={merchantDetail.callback_url} target='_blank' rel='noopener noreferrer'>
                        {merchantDetail.callback_url}
                      </a>
                    ) : (
                      '-'
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label='Testing Mode'>
                    <Tag color={merchantDetail.testing === 1 ? 'orange' : 'green'}>
                      {merchantDetail.testing === 1 ? 'Testing' : 'Production'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label='Language'>
                    <Tag>{merchantDetail.lang || 'id'}</Tag>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Skeleton active paragraph={{ rows: 4 }} />
              )}
            </Card>

            {/* Apps Section */}
            <Card
              title={
                <Space>
                  <AppstoreOutlined />
                  <span>Daftar Aplikasi</span>
                </Space>
              }
              style={{ marginTop: '24px' }}
              loading={isLoading}
            >
              {merchantDetail ? (
                <Table
                  dataSource={merchantDetail.apps}
                  rowKey='id'
                  size='small'
                  pagination={false}
                  columns={[
                    {
                      title: 'App Name',
                      dataIndex: 'app_name',
                      key: 'app_name',
                    },
                    {
                      title: 'App ID',
                      dataIndex: 'appid',
                      key: 'appid',
                      render: (appid, record) =>
                        renderSensitiveField(appid, visibleAppKeys[record.id] || false, () =>
                          toggleAppKeyVisibility(record.id),
                        ),
                    },
                    {
                      title: 'App Key',
                      dataIndex: 'appkey',
                      key: 'appkey',
                      render: (appkey, record) =>
                        renderSensitiveField(appkey, visibleAppKeys[record.id] || false, () =>
                          toggleAppKeyVisibility(record.id),
                        ),
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
                    },
                    {
                      title: 'Testing',
                      dataIndex: 'testing',
                      key: 'testing',
                      render: (testing) => (
                        <Tag color={testing === 1 ? 'orange' : 'green'}>{testing === 1 ? 'Testing' : 'Production'}</Tag>
                      ),
                    },
                    {
                      title: 'Callback URL',
                      dataIndex: 'callback_url',
                      key: 'callback_url',
                      render: (url) =>
                        url ? (
                          <Tooltip title={url}>
                            <a href={url} target='_blank' rel='noopener noreferrer'>
                              {url.length > 30 ? `${url.substring(0, 30)}...` : url}
                            </a>
                          </Tooltip>
                        ) : (
                          '-'
                        ),
                    },
                  ]}
                />
              ) : (
                <Skeleton active paragraph={{ rows: 3 }} />
              )}
            </Card>

            {/* Settlements Section */}
            <Card
              title={
                <Space>
                  <SettingOutlined />
                  <span>Settlement Configuration</span>
                </Space>
              }
              style={{ marginTop: '24px' }}
              loading={isLoading}
            >
              {merchantDetail ? (
                <Table
                  dataSource={merchantDetail.settlements}
                  rowKey='id'
                  size='small'
                  pagination={false}
                  columns={[
                    {
                      title: 'Payment Method',
                      dataIndex: 'name',
                      key: 'name',
                      render: (name) => <Tag color='processing'>{name.replace(/_/g, ' ').toUpperCase()}</Tag>,
                    },
                    {
                      title: 'MDR',
                      dataIndex: 'mdr',
                      key: 'mdr',
                      render: (mdr) => `${mdr}%`,
                    },
                    {
                      title: 'PPN',
                      dataIndex: 'additional_percent',
                      key: 'additional_percent',
                      render: (percent) => (percent ? `${percent}%` : 'Tidak'),
                    },
                    {
                      title: 'Service Charge',
                      dataIndex: 'servicecharge',
                      key: 'servicecharge',
                      render: (charge) => `${charge}%`,
                    },
                    {
                      title: 'Tax 23',
                      dataIndex: 'tax23',
                      key: 'tax23',
                      render: (tax) => (tax === '1' ? 'Ya' : 'Tidak'),
                    },
                    {
                      title: 'Share Partner',
                      dataIndex: 'share_partner',
                      key: 'share_partner',
                      render: (share) => `${share}%`,
                    },
                    {
                      title: 'Share Redision',
                      dataIndex: 'share_redision',
                      key: 'share_redision',
                      render: (share) => `${share}%`,
                    },
                  ]}
                />
              ) : (
                <Skeleton active paragraph={{ rows: 3 }} />
              )}
            </Card>
          </Col>

          {/* Sidebar Information */}
          <Col xs={24} lg={8}>
            {/* Payment Methods */}
            <Card title='Payment Methods' loading={isLoading} style={{ marginBottom: '24px' }}>
              {merchantDetail ? (
                <div>
                  {!merchantDetail.payment_methods || merchantDetail.payment_methods.length === 0 ? (
                    <Typography.Text type='secondary'>Tidak ada payment method</Typography.Text>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {merchantDetail.payment_methods.map((item, index) => (
                        <Tag key={index} color='processing'>
                          {item.name.replace(/_/g, ' ').toUpperCase()}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Skeleton active paragraph={{ rows: 2 }} />
              )}
            </Card>

            {/* Timestamps */}
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  <span>Timeline</span>
                </Space>
              }
              loading={isLoading}
            >
              {merchantDetail ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>Date Created</div>
                    <Typography.Text type='secondary'>
                      {merchantDetail.created_at
                        ? dayjs(merchantDetail.created_at).format('DD MMM YYYY, HH:mm:ss')
                        : '-'}
                    </Typography.Text>
                  </div>
                  <Divider style={{ margin: '8px 0' }} />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>Last Updated</div>
                    <Typography.Text type='secondary'>
                      {merchantDetail.updated_at
                        ? dayjs(merchantDetail.updated_at).format('DD MMM YYYY, HH:mm:ss')
                        : '-'}
                    </Typography.Text>
                  </div>
                </div>
              ) : (
                <Skeleton active paragraph={{ rows: 3 }} />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Box>
  )
}

export default DetailMerchant
