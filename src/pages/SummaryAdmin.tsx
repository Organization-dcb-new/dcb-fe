import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Collapse } from 'antd'
import { LineChart } from '@mui/x-charts/LineChart'
import dayjs from 'dayjs'

const keyToLabel: { [key: string]: string } = {
  success: 'Success',
  canceled: 'Canceled',
  failed: 'Failed',
}
const mockData = [
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

function Chart() {
  const theme = useTheme()

  return (
    <Card variant='outlined' sx={{ width: '100%' }}>
      <CardContent>
        <LineChart
          colors={[theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main]}
          dataset={mockData}
          xAxis={[
            {
              dataKey: 'datetime',
              scaleType: 'time',
              valueFormatter: (date) => dayjs(date * 1000).format('DD MMM'),
            },
          ]}
          series={Object.keys(keyToLabel).map((key) => ({
            dataKey: key,
            label: keyToLabel[key],
            showMark: false,
          }))}
          height={360}
          margin={{ left: 50, right: 20, bottom: 20 }}
          grid={{ horizontal: true }}
          slotProps={{
            legend: {
              labelStyle: {
                fontSize: 14,
              },
            },
          }}
        />
      </CardContent>
    </Card>
  )
}

const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num)

const clientTransaction = [
  {
    name: 'Client 1',
    total: 80,
  },
  {
    name: 'Client 2',
    total: 809,
  },
  {
    name: 'Client 3',
    total: 100,
  },
]

const SummaryAdmin = () => {
  return (
    <div className='space-y-4 px-6 py-8'>
      <Typography component='h2' variant='h6'>
        Summary
      </Typography>
      <Collapse
        items={[
          {
            key: '1',
            label: (
              <Typography component='span' variant='subtitle1' fontSize='16px' fontWeight={700}>
                Total Transaction All Client: {formatNumber(1000)}
              </Typography>
            ),
            children: (
              <div className='flex flex-col'>
                {clientTransaction.map((item) => (
                  <div key={item.name} className='py-2 border-b border-grey-100'>
                    <Typography variant='body1' fontWeight={400} className='inline-block min-w-[160px]'>
                      {item.name}
                    </Typography>
                    <Typography component='span' variant='body1' fontWeight={600}>
                      {formatNumber(item.total)} Transactions
                    </Typography>
                  </div>
                ))}
              </div>
            ),
          },
        ]}
      />
      <Chart />
    </div>
  )
}

export default SummaryAdmin
