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
        app: {
            flexGrow:1,
            flexShrink:1,
            overflow: "hidden",
            display: "flex", flexDirection: "column", flexWrap: "nowrap",
        },

        app_bar: {
            flexGrow:0,
            flexShrink:0,
            position:"relative",
            zIndex: 100,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
        },

        app_bar_with_open_side_panel: {
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginRight: drawerWidth,
        },

        main : {
            position:"relative",
            zIndex: 1,
            flexGrow:1, flexShrink:1,
            display:"flex", flexDirection:"row", flexWrap: "nowrap",
        },

        content: {
            height:"100%",
            flexGrow:1, flexShrink:1,
            display:"flex", flexDirection:"column", flexWrap: "nowrap",
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            marginRight: -drawerWidth,
        },

        content_with_open_side_panel: {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginRight: 0,
        },

        drawer: {
            width: drawerWidth,
            flexShrink: 0,
            overflow:"hidden",
        },

        side_panel: {
            backgroundColor:theme.palette.background.paper,
            width: drawerWidth,
            position:"relative", zIndex: 1000,
        },

        side_panel_content: {
            // marginTop:1, padding:5,
        },

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
    const handle_open_side_panel = () => set_side_panel_open(true);
    const handle_close_side_panel = () => set_side_panel_open(false);

    return (
        <ThemeProvider theme={DefaultTheme}>
            <CssBaseline />
            <Box id="app" className={classes.app}>
                <AppBar position="static" className={clsx(classes.app_bar, { [classes.app_bar_with_open_side_panel]: side_panel_open })}>
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
                            <Box className={`${classes.toolbar_item}`}>
                                <SyncInfo />
                            </Box>
                            <Box className={`${classes.toolbar_item}`}>
                                <StorageInfo />
                            </Box>
                            <Box className={`${classes.toolbar_item}`}>
                                <UserInfo />
                            </Box>

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
                <Box component="main"  className={`${classes.main} ${(side_panel_open) ? 'side_panel_open' : 'side_panel_closed' }`}>
                    <Box id="app_content" className={clsx(classes.content, { [classes.content_with_open_side_panel]: side_panel_open, })}>
                        <MainAreaRouter />
                    </Box>
                    <Drawer
                        anchor="right"
                        className={classes.drawer}
                        open={side_panel_open}
                        variant="persistent"
                    >
                        <Box component="aside" className={classes.side_panel} id="side_panel">
                            <AppBar  position="sticky">
                                <Toolbar variant="dense">
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
                            {/* <AppBar  position="sticky" className={classes.drawer_header}>
                                <Toolbar variant="dense">

                                </Toolbar>
                            </AppBar> */}
                            <Box id="side_panel_content" classNames={classes.side_panel_content}>
                                <AppMenuItemsContainer />
                                <SidePanel />
                            </Box>
                        </Box>
                    </Drawer>
                    <HelpMenu />
                </Box>
                <Box component="footer"></Box>
            </Box>
        </ThemeProvider>
    )
}

export default App
