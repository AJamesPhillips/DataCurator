import { h } from "preact"
import { useState } from "react"
import clsx from 'clsx';
import { AppBar, Box, CssBaseline, Drawer, IconButton, makeStyles, ThemeProvider, Toolbar } from "@material-ui/core"

import "./App.scss"
import { MainAreaRouter } from "./layout/MainAreaRouter"
import { AppMenuItemsContainer } from "./layout/AppMenuItemsContainer"
import { SidePanel } from "./side_panel/SidePanel"
import { ViewsBreadcrumb } from "./views/ViewsBreadcrumb"
import { DefaultTheme } from "./ui_themes/material_default"
import { ViewOptions } from "./views/ViewOptions"
import { StorageInfo } from "./sync/storage_type/StorageInfo"
import { UserInfo } from "./sync/user_info/UserInfo"
import { BackupInfo } from "./sync/sync_backup_info/BackupInfo"
import { SyncInfo } from "./sync/sync_backup_info/SyncInfo"
import { HelpMenu } from "./help_menu/HelpMenu"
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';

function App()
{
    const drawerWidth = 340;
    const useStyles = makeStyles(theme => ({
        root: {
            width:"100%", height:"100%",
            overflow: "hidden",
            display: "flex",
        },

        app_bar: {
            marginRight:0,
            width:"100%", maxWidth:"100%", minWidth:0,
            transition: theme.transitions.create(['all'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            zIndex: theme.zIndex.drawer + 1,
        },

        app_bar_with_open_side_panel: {
            width: `calc(100% - ${drawerWidth}px)`, maxWidth:`calc(100% - ${drawerWidth}px)`,
            marginRight: drawerWidth,
            transition: theme.transitions.create(['all'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        content: {
            position:"relative", zIndex: 1,
            flexGrow:1,
            flexShrink:1,
            display:"flex", flexDirection:"column", flexWrap: "nowrap",
            marginRight: -drawerWidth,
            transition: theme.transitions.create(['margin'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },

        content_with_open_side_panel: {
            marginRight: 0,
            transition: theme.transitions.create(['margin'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },

        drawer: {
            width: drawerWidth,
            flexShrink: 0,
        },

        side_panel: {
            backgroundColor:theme.palette.background.paper,
            width: drawerWidth,
        },

        side_panel_content: {
            marginTop:10, padding:10,
        },
        sidebar_toolbar: {
            flexGrow:1,
            justifyContent:"flex-end"
        },
        toolbar: {
            flexGrow: 1,
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
        small_full_width: {
            [theme.breakpoints.down('sm')]: {
                flexGrow:0, flexShrink:1, flexBasis:"100%",
                margin: 0,
            }
        },
        grow: { flexGrow:1 },
        hide: { display: 'none' },
      }));

    const classes = useStyles();
    const [side_panel_open, set_side_panel_open] = useState(true);
    const handle_open_side_panel = () => { set_side_panel_open(true); console.log("open"); }
    const handle_close_side_panel = () => { set_side_panel_open(false); console.log("closed"); }

    return (
        <ThemeProvider theme={DefaultTheme}>
            <CssBaseline />
            <Box id="app" className={classes.root}>
                <AppBar elevation={1} id="header" position="fixed" className={clsx(classes.app_bar, { [classes.app_bar_with_open_side_panel]: side_panel_open })}>
                    <Toolbar variant="dense" className={classes.toolbar}>
                        <Box className={`${classes.toolbar_section} ${classes.grow} ${classes.small_full_width}`}>
                            <Box className={`${classes.toolbar_item}`}>
                                <ViewOptions />
                            </Box>
                            <Box className={`${classes.toolbar_item} ${classes.grow}`}>
                                <ViewsBreadcrumb />
                            </Box>
                        </Box>
                        <Box className={`${classes.toolbar_section} ${classes.small_full_width}`} justifyContent="flex-end">
                            <Box className={`${classes.toolbar_item}`}><BackupInfo /></Box>
                            <Box className={`${classes.toolbar_item}`}><SyncInfo /></Box>
                            <Box className={`${classes.toolbar_item}`}><StorageInfo /></Box>
                            <Box className={`${classes.toolbar_item}`}><UserInfo /></Box>
                            <Box className={`${classes.toolbar_item}`}>
                                <IconButton
                                    aria-label="open side panel"
                                    className={clsx(side_panel_open && classes.hide)}
                                    color="inherit"
                                    edge="end"
                                    onClick={handle_open_side_panel}
                                    size="small"
                                >
                                    <MenuIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Box id="app_content" component="main" className={clsx(classes.content, { [classes.content_with_open_side_panel]: side_panel_open, })}>
                    <MainAreaRouter />
                </Box>
                <Drawer
                    anchor="right"
                    className={classes.drawer}
                    open={side_panel_open}
                    variant="persistent"
                >
                    <Box component="aside" className={classes.side_panel} id="side_panel">
                        <AppBar elevation={1}  position="sticky">
                            <Toolbar variant="dense" className={classes.sidebar_toolbar}>
                                <IconButton
                                    color="inherit"
                                    aria-label="Close side panel"
                                    edge="end"
                                    onClick={handle_close_side_panel}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </Toolbar>
                        </AppBar>
                        <Box id="side_panel_content" className={classes.side_panel_content}>
                            <AppMenuItemsContainer />
                            <SidePanel />
                        </Box>
                    </Box>
                </Drawer>
                <HelpMenu />
            </Box>
        </ThemeProvider>
    )
}

export default App
