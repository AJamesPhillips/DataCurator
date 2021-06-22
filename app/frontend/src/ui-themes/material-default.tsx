import type { ThemeOptions } from "@material-ui/core/styles";
import { createMuiTheme }  from '@material-ui/core/styles'

const _defaultThemeOptions: ThemeOptions = {
  palette: {
    type: 'light',
    primary: {
      main: '#cfd8dc',
    },
    secondary: {
      main: '#b2ebf2',
    },
  },
};

const DefaultTheme = createMuiTheme(_defaultThemeOptions)
export default DefaultTheme