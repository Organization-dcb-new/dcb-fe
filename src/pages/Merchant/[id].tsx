import { Box, Stack } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Link } from 'react-router-dom'

const DetailMerchant = () => {
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
          justifyContent: 'space-between',
          flexDirection: 'row',
          mx: 3,
          pb: 5,
          mt: { xs: 8, md: 0 },
        }}
      >
        DetailMerchant
        <Link to='/merchant'>
          <button>Back</button>
        </Link>
      </Stack>
    </Box>
  )
}

export default DetailMerchant
