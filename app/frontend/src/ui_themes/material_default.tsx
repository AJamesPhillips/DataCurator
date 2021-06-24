import type { ThemeOptions } from "@material-ui/core/styles";
import { createMuiTheme }  from '@material-ui/core/styles'
import { h } from "preact";
const _defaultThemeOptions: ThemeOptions = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    type: 'light',
	primary: {
      main: '#eceff1',
    },
    secondary: {
      main: '#2196f3',
    },
    warning: {
      main: '#ff9800',
    },

    error: {
      main: '#f44336',
    },

    info: {
      main: '#2196f3',
    },

    success: {
      main: '#4caf50'
    }
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

export const DefaultTheme = createMuiTheme(_defaultThemeOptions)
export const WarningTheme = createMuiTheme({ ...DefaultTheme, palette: { primary: _defaultThemeOptions.palette?.warning } });
export const ErrorTheme = createMuiTheme({ ...DefaultTheme, palette: { primary: _defaultThemeOptions.palette?.error } });
export const InfoTheme = createMuiTheme({ ...DefaultTheme, palette: { primary: _defaultThemeOptions.palette?.info } });
export const SuccessTheme = createMuiTheme({ ...DefaultTheme, palette: { primary: _defaultThemeOptions.palette?.success } });