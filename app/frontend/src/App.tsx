import "./App.scss"
import { h } from "preact"
import { AppBar, Box, CssBaseline, ThemeProvider, Toolbar } from "@material-ui/core"
import { MainAreaRouter } from "./layout/MainAreaRouter";
import { ViewsBreadcrumb } from "./views/ViewsBreadcrumb"
import { TabsContainer } from "./layout/TabsContainer";
import { SidePanel } from "./side_panel/SidePanel";
import default_theme from "./ui_themes/material_default";

function App() {
  return (
    <ThemeProvider theme={default_theme}>
      <CssBaseline />
      <Box id="app" className="app">
        <Box component="header">
        <AppBar position="static">
            <Toolbar variant="dense">
              <ViewsBreadcrumb />
            </Toolbar>
          </AppBar>
        </Box>
        <Box component="main">
          <Box id="app_content">
            <MainAreaRouter />
          </Box>
          <Box id="side_panel" component="aside" p={1} mt={1}>
            <TabsContainer content_changed={() => {}} />
            <SidePanel />
          </Box>
        </Box>
        <Box component="footer"></Box>
      </Box>
    </ThemeProvider>
  )
}
export default App
