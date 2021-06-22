import type { ThemeOptions } from "@material-ui/core/styles";
import { createMuiTheme }  from '@material-ui/core/styles'
const _defaultThemeOptions: ThemeOptions = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },palette: {
    type: 'light',
    primary: {
      main: '#eceff1',
    },
    secondary: {
      main: '#b3e5fc',
    },
  },
  spacing: 2,
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
};

const DefaultTheme = createMuiTheme(_defaultThemeOptions)
export default DefaultTheme