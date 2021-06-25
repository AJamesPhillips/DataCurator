import { h } from "preact";
import type { ThemeOptions } from "@material-ui/core/styles";
import { createMuiTheme }  from '@material-ui/core/styles'
const _default_theme_options: ThemeOptions = {
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
      main: '#D32F2F',
    },

    error: {
      main: '#B71C1C',
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

export const DefaultTheme = createMuiTheme(_default_theme_options)
export const WarningTheme = createMuiTheme({ ...DefaultTheme, palette: { primary: _default_theme_options.palette?.warning, secondary: _default_theme_options.palette?.error } });
export const ErrorTheme = createMuiTheme({ ...DefaultTheme, palette: { primary: _default_theme_options.palette?.error } });
export const InfoTheme = createMuiTheme({ ...DefaultTheme, palette: { primary: _default_theme_options.palette?.info } });
export const SuccessTheme = createMuiTheme({ ...DefaultTheme, palette: { primary: _default_theme_options.palette?.success } });