import { h } from "preact"
import { AppBar, Box, CssBaseline, makeStyles, ThemeProvider, Toolbar, Typography} from "@material-ui/core";

import "./App.scss"
import { MainAreaRouter } from "./layout/MainAreaRouter"
import { TabsContainer } from "./layout/TabsContainer"
import { SidePanel } from "./side_panel/SidePanel"
import { ViewsBreadcrumb } from "./views/ViewsBreadcrumb"
import { DefaultTheme } from "./ui_themes/material_default"
import { ViewOptions } from "./views/ViewOptions"
import { StorageInfo } from "./sync/storage_type/StorageInfo"
import { UserInfo } from "./sync/user_info/UserInfo"
import { BackupInfo } from "./sync/sync_backup_info/BackupInfo"
import { SyncInfo } from "./sync/sync_backup_info/SyncInfo"

function App()
{
    const useStyles = makeStyles(theme => ({
        toolbar: {
            justifyContent:"space-between",
            flexWrap:"wrap",
            [theme.breakpoints.up('md')]: {
                flexWrap:"nowrap"
            }
        },
        toolbar_section: {
            display:"inherit",
            flexGrow:0,
            flexShrink:1,
            flexBasis:"auto",
            marginRight:5,
            "&:last-child": { marginRight:0 },
            "&:empty": { display:"none" }
        },
        toolbar_item: {
            marginRight:5,
            "&:last-child": { marginRight:0 }


        },
        grow: {
            flexGrow:1,
        },
        small_full_width: {
            [theme.breakpoints.down('sm')]: {
                flexGrow:0, flexShrink:1, flexBasis:"100%",
                margin: 0,
                // justifyContent:"flex-end",
                // "& > *:last-child": {
                //     border:"1px purple solid",
                //     // flexGrow:1,
                // },
            }
        }

      }));
    const classes = useStyles();
    return (
        <ThemeProvider theme={DefaultTheme}>
            <CssBaseline />
            <Box id="app" className="app">
                <Box component="header" zIndex={100}>
                    <AppBar position="static">
                        <Toolbar variant="dense" className={classes.toolbar}>
                            <Box className={`${classes.toolbar_section} ${classes.grow} ${classes.small_full_width}`}>
                                <Box className={`${classes.toolbar_item}`}>
                                    <ViewOptions />
                                </Box>
                                <Box className={`${classes.toolbar_item} ${classes.grow}`}>
                                    <ViewsBreadcrumb />
                                </Box>
                            </Box>
                            {/* <Box className={`${classes.toolbar_section} ${classes.grow}`} justifyContent="space-between">

                            </Box> */}
                            <Box className={`${classes.toolbar_section} ${classes.small_full_width}`} justifyContent="flex-end">
                                <Box className={`${classes.toolbar_item}`}><BackupInfo /></Box>
                                <Box className={`${classes.toolbar_item}`}>
                                    <SyncInfo />
                                </Box>
                                <Box className={`${classes.toolbar_item}`}>
                                    <StorageInfo />
                                </Box>
                                <Box className={`${classes.toolbar_item}`}>
                                    <UserInfo />
                                </Box>
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
