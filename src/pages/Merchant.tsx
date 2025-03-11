import { useEffect, useState } from 'react'

import { Box, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Table } from 'antd'
import { ColumnType } from 'antd/es/table'
import axios from 'axios'
import { useAuth } from '../provider/AuthProvider'

const Merchant = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [data, setData] = useState<MerchantListDataModel[]>([])
  const { token, apiUrl } = useAuth()

  const onGetMerchant = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get<{ data?: MerchantListDataApi[] }>(`${apiUrl}/admin/merchants`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const merchantsData = Array.isArray(response.data?.data) ? response.data.data : []

      const data: MerchantListDataModel[] = merchantsData.map((item) => ({
        uid: item.u_id,
        clientName: item.client_name,
        clientAppkey: item.client_appkey,
        clientSecret: item.client_secret,
        clientAppid: item.client_appid,
        appName: item.app_name,
        mobile: item.mobile,
        clientStatus: item.client_status,
        phone: item.phone,
        email: item.email,
        testing: item.testing,
        lang: item.lang,
        callbackUrl: item.callback_url,
        failCallback: item.fail_callback,
        isdcb: item.isdcb,
        updatedAt: item.updated_at,
        createdAt: item.created_at,
        paymentMethods: item.payment_methods.map((method) => ({
          id: method.id,
          name: method.name,
          route: method.route,
          flexible: method.flexible,
          status: method.status,
          msisdn: method.msisdn,
          clientId: method.client_id,
        })),
        settlements: item.settlements.map((settlement) => ({
          id: settlement.id,
          clientId: settlement.client_id,
          name: settlement.name,
          isBhpuso: settlement.is_bhpuso,
          serviceCharge: settlement.servicecharge,
          tax23: settlement.tax23,
          ppn: settlement.ppn,
          mdr: settlement.mdr,
          mdrType: settlement.mdr_type,
          additionalFee: settlement.additionalfee,
          additionalPercent: settlement.additional_percent,
          additionalFeeType: settlement.additionalfee_type,
          paymentType: settlement.payment_type,
          shareRedision: settlement.share_redision,
          sharePartner: settlement.share_partner,
          isDivide1poin1: settlement.is_divide_1poin1,
          updatedAt: settlement.updated_at,
          createdAt: settlement.created_at,
        })),
        apps: item.apps.map((app) => ({
          id: app.id,
          appName: app.app_name,
          appid: app.appid,
          appkey: app.appkey,
          callbackUrl: app.callback_url,
          testing: app.testing,
          status: app.status,
          mobile: app.mobile,
          failCallback: app.fail_callback,
          clientId: app.client_id,
          createdAt: app.created_at,
          updatedAt: app.updated_at,
        })),
      }))

      setData(data)
    } catch (error) {
      console.log('aaa', error)
    }
    setIsLoading(false)
  }

  const columns: ColumnType<any>[] = [
    {
      title: 'Merchant Name',
      dataIndex: 'appName',
      key: 'appName',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'User ID',
      dataIndex: 'uid',
      key: 'uid',
      render: (text) => <a>{text}</a>,
    },

    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Action',
      key: 'action',
      dataIndex: 'id',
      align: 'center',
      render: () => (
        <Stack direction='row' justifyContent='center' spacing={2}>
          <a href='#'>Edit</a>
          <a href='#'>Delete</a>
        </Stack>
      ),
    },
  ]

  useEffect(() => {
    onGetMerchant()
  }, [])

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
        <Box sx={{ width: '100%', maxWidth: '96vw' }}>
          <Typography component='h2' variant='h6' sx={{ mb: 2 }}>
            Merchant Data
          </Typography>
          <Table columns={columns} dataSource={data} loading={isLoading} size='small' className='transactions-table ' />
        </Box>
      </Stack>
    </Box>
  )
}

export default Merchant
