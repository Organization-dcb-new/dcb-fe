import { useState } from 'react'

import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { CancelOutlined, CheckCircleOutlined, ChevronRight, RemoveCircleOutline } from '@mui/icons-material'

type Status = 'success' | 'failed' | 'canceled'
interface Props {
  status: Status
  value: number | undefined
}

const getStatus = (status: Status) => {
  switch (status) {
    case 'failed':
      return {
        label: 'Failed',
        variant: {
          background: 'bg-red-800',
          border: 'border-red-800',
        },
        icon: <CancelOutlined className='size-10 lg:size-[72px]' />,
      }
    case 'success':
      return {
        label: 'Success',
        variant: { background: 'bg-teal-800', border: 'border-teal-800' },
        icon: <CheckCircleOutlined className='size-10 lg:size-[72px]' />,
      }
    case 'canceled':
      return {
        label: 'Canceled',
        variant: {
          background: 'bg-yellow-800',
          border: 'border-yellow-800',
        },
        icon: <RemoveCircleOutline className='size-10 lg:size-[72px]' />,
      }
  }
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

const SummaryCard = ({ status, value }: Props) => {
  const { label, variant, icon } = getStatus(status)

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
          <Button sx={{ lineHeight: '14px' }} size='small' variant='text' endIcon={<ChevronRight />}>
            View Detail
          </Button>
        </CardActions>
      </>
    </Card>
  )
}

const Summary = () => {
  const [freq, setFreq] = useState('daily')
  const [paymentMethod, setPaymentMethod] = useState('all')

  return (
    <div className='space-y-4 w-full'>
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between w-full'>
        <Typography variant='h2' fontWeight='bold' fontSize={18}>
          Summary
        </Typography>
        <div className='flex flex-col sm:flex-row gap-4 items-stretch sm:items-end w-full sm:w-auto'>
          <FormControl variant='standard'>
            <InputLabel id='paymentMethod'>Payment Method</InputLabel>
            <Select
              sx={{ width: { xs: '100%', sm: 160 }, padding: '8px 12px', height: 40, borderRadius: 1 }}
              labelId='paymentMethod'
              id='paymentMethod'
              value={paymentMethod}
              label='Payment Method'
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <MenuItem value='all'>All</MenuItem>
              <MenuItem value='ovo'>OVO</MenuItem>
              <MenuItem value='qris'>Qris</MenuItem>
              <MenuItem value='pulsa'>Pulsa</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant='standard'>
            <InputLabel id='frequency'>Frequency</InputLabel>
            <Select
              sx={{ width: { xs: '100%', sm: 160 }, padding: '8px 12px', height: 40, borderRadius: 1 }}
              labelId='frequency'
              id='frequency'
              value={freq}
              label='Frequency'
              onChange={(event) => setFreq(event.target.value)}
            >
              <MenuItem value='daily'>Daily</MenuItem>
              <MenuItem value='monthly'>Monthly</MenuItem>
            </Select>
          </FormControl>
          <Button sx={{ width: { xs: '100%', sm: 160 } }} variant='contained' color='secondary'>
            Export Data
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full'>
        <SummaryCard status='success' value={222} />
        <SummaryCard status='canceled' value={11} />
        <SummaryCard status='failed' value={9289} />
        <Card variant='outlined' className='flex-1'>
          <CardContent className='flex flex-col gap-4 !p-4'>
            <div>
              <Typography component='h2' variant='subtitle2'>
                Total Transactions
              </Typography>
              <Typography variant='h4' component='span'>
                {formatNumber(10000)}
              </Typography>
            </div>
            <div>
              <Typography component='h2' variant='subtitle2'>
                Total Revenue
              </Typography>
              <Typography variant='h4' component='span'>
                ${formatNumber(873337)}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Summary
