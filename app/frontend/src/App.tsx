import { h } from "preact"
import { AppBar, Box, CssBaseline, ThemeProvider, Toolbar } from "@material-ui/core"

import "./App.scss"
import { MainAreaRouter } from "./layout/MainAreaRouter"
import { TabsContainer } from "./layout/TabsContainer"
import { SidePanel } from "./side_panel/SidePanel"
import default_theme from "./ui_themes/material-default"
import { ViewsBreadcrumb } from "./views/ViewsBreadcrumb"



function App() {
    return (
        <ThemeProvider theme={default_theme}>
            <CssBaseline />
            <div class="app">
                <header>
                    <AppBar position="static">
                        <Toolbar variant="dense">
                            <ViewsBreadcrumb />
                        </Toolbar>
                    </AppBar>
                </header>
                <main>
                    <div id="app_content">
                        <MainAreaRouter />
                    </div>
                    <aside id="side_panel">
                        <Box p={1} mt={1}>
                            <TabsContainer content_changed={() => {}} />
                            <SidePanel />
                        </Box>
                    </aside>
                </main>
                <footer />
            </div>
        </ThemeProvider>
    )
}
export default App
