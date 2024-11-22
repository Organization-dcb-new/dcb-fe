// src/mui.d.ts
import { Theme as MuiTheme } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Theme {
    vars?: {
      palette: {
        [key: string]: string
      }
    }
  }
}
