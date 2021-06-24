import { h } from "preact"
import { AppBar, Box, CssBaseline, ThemeProvider, Toolbar } from "@material-ui/core"

import "./App.scss"
import { MainAreaRouter } from "./layout/MainAreaRouter"
import { TabsContainer } from "./layout/TabsContainer"
import { SidePanel } from "./side_panel/SidePanel"
import { ViewsBreadcrumb } from "./views/ViewsBreadcrumb"
import { DefaultTheme } from "./ui_themes/material_default"

function App()
{
    return (
        <ThemeProvider theme={DefaultTheme}>
            <CssBaseline />
            <Box id="app" className="app">
                <Box component="header" zIndex={1}>
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
                    <Box id="side_panel" component="aside" p={5} mt={1}>
                        <TabsContainer />
                        <SidePanel />
                    </Box>
                </Box>
                <Box component="footer"></Box>
            </Box>
        </ThemeProvider>
    )
}
export default App
