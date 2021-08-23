import { h } from "preact"
import { AppBar, Box, CssBaseline, ThemeProvider, Toolbar } from "@material-ui/core"

import "./App.scss"
import { MainAreaRouter } from "./layout/MainAreaRouter"
import { TabsContainer } from "./layout/TabsContainer"
import { SidePanel } from "./side_panel/SidePanel"
import { ViewsBreadcrumb } from "./views/ViewsBreadcrumb"
import { DefaultTheme } from "./ui_themes/material_default"
import { ViewOptions } from "./views/ViewOptions"
import { StorageInfo } from "./sync/storage_type/StorageInfo"
import { SyncBackupInfo } from "./sync/sync_backup_info/SyncBackupInfo"
import { UserInfo } from "./sync/user_info/UserInfo"
import { BackupInfo } from "./sync/sync_backup_info/BackupInfo"

function App()
{
    return (
        <ThemeProvider theme={DefaultTheme}>
            <CssBaseline />
            <Box id="app" className="app">
                <Box component="header" zIndex={100}>
                    <AppBar position="static">
                        <Toolbar variant="dense" >
                            <ViewOptions />
                            <ViewsBreadcrumb />
                            <Box flexGrow={1} display="flex" justifyContent="flex-end">
                                <SyncBackupInfo />
                                <StorageInfo />
                                <UserInfo />
                            </Box>
                        </Toolbar>
                    </AppBar>
                </Box>
                <Box component="main" position="relative" zIndex={1}>
                    <Box id="app_content">
                        <MainAreaRouter />
                    </Box>
                    <Box component="aside" id="side_panel" bgcolor="#fafafa"  p={5} mt={1} position="relative" zIndex={10}>
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
