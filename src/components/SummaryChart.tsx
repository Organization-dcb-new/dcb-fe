import { useTheme } from '@mui/material/styles'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { LineChart } from '@mui/x-charts/LineChart'
import dayjs from 'dayjs'

interface SummaryChartProps {
  dataset: any[]
  keyToLabel: { [key: string]: string }
}
function SummaryChart({ dataset, keyToLabel }: SummaryChartProps) {
  const theme = useTheme()

  return (
    <Card variant='outlined' sx={{ width: '100%' }}>
      <CardContent>
        <LineChart
          colors={[theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main]}
          dataset={dataset}
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
                marginLeft: 12,
              },
            },
          }}
        />
      </CardContent>
    </Card>
  )
}

export default SummaryChart
