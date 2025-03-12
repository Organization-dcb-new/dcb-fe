import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import dayjs from 'dayjs'

import { Chip, Skeleton, Typography } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'

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
  const { merchantDetail } = useMerchantDetail(id)

  const lists = [
    {
      label: 'Merchant Name',
      value: merchantDetail?.client_name,
    },
    {
      label: 'Phone',
      value: merchantDetail?.phone,
    },
    {
      label: 'Email',
      value: merchantDetail?.email,
    },
    {
      label: 'UID',
      value: merchantDetail?.u_id,
    },
    {
      label: 'Application Name',
      value: merchantDetail?.app_name,
    },
    {
      label: 'Application Type',
      value: merchantDetail?.mobile ? 'Mobile App' : 'Web App',
    },
    {
      label: 'Date Created',
      value: merchantDetail ? dayjs(merchantDetail.created_at).format('YYYY-MM-DD, HH:mm:ss') : null,
    },
    {
      label: 'Last Updated',
      value: merchantDetail ? dayjs(merchantDetail.updated_at).format('YYYY-MM-DD, HH:mm:ss') : null,
    },
    {
      label: 'Payment Methods',
      value: merchantDetail ? (
        <div className='flex gap-2 items-center'>
          {merchantDetail?.payment_methods.map((item) => (
            <Chip
              className='bg-transparent'
              variant='outlined'
              label={
                <Typography component='span' fontSize={12} className='text-gray-900'>
                  {item.name}
                </Typography>
              }
            />
          ))}
        </div>
      ) : null,
    },
    {
      label: 'Callback URL',
      value: merchantDetail?.callback_url,
    },
  ]

  return (
    <div className='flex flex-col gap-4 px-6 py-8'>
      <div className='flex gap-4 items-center'>
        <ArrowBack onClick={() => navigate(-1)} className='cursor-pointer' />
        <Typography component='h2' variant='h4'>
          Merchant Detail
        </Typography>
      </div>
      <div>
        {lists.map(({ label, value }) => (
          <div key={label} className='flex gap-4 items-center py-3 border-b border-gray-300'>
            <Typography component='span' variant='body1' fontWeight={600} className='min-w-[100px] md:min-w-[200px]'>
              {label}
            </Typography>
            <Typography component='span' variant='body1'>
              {value || <Skeleton width={100} className='bg-gray-200' />}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DetailMerchant
