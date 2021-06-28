import type { ThemeOptions } from "@material-ui/core/styles";
import { createMuiTheme }    from '@material-ui/core/styles'
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
            main: '#e0e0e0',
        },
        secondary: {
            main: '#b3e5fc',
        },
        warning: {
            main: '#f57c00',
        },

        error: {
            main: '#b71c1c',
        },

        info: {
            main: '#26c6da',
        },

        success: {
            main: '#7cb342'
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