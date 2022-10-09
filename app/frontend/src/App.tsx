import { FunctionalComponent, h } from "preact"
import { useEffect } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import clsx from "clsx"
import { AppBar, Box, CssBaseline, Drawer, makeStyles, ThemeProvider, Toolbar, Typography } from "@material-ui/core"

import "./App.scss"
import { MainAreaRouter } from "./layout/MainAreaRouter"
import { AppMenuItemsContainer } from "./layout/AppMenuItemsContainer"
import { SidePanel } from "./side_panel/SidePanel"
import { ViewsBreadcrumb } from "./views/ViewsBreadcrumb"
import { DefaultTheme } from "./ui_themes/material_default"
import { ViewOptions } from "./views/ViewOptions"
import { StorageInfo } from "./sync/storage_location/StorageInfo"
import { UserInfo } from "./sync/user_info/UserInfo"
import { SyncInfo } from "./sync/SyncInfo"
import { HelpMenu } from "./help_menu/HelpMenu"
import { ActiveCreatedAtFilterWarning } from "./sharedf/ActiveCreatedAtFilterWarning"
import { ActiveCreationContextWarning } from "./sharedf/ActiveCreationContextWarning"
import { ActiveFilterWarning } from "./sharedf/ActiveFilterWarning"
import { SidePanelOrMenuButton } from "./side_panel/SidePanelOrMenuButton"
import type { RootState } from "./state/State"
import { Modal } from "./modal/Modal"
import { get_store } from "./state/store"
import { check_and_handle_connection_and_session } from "./sync/user_info/window_focus_session_check"
import { date_to_string } from "./form/datetime_utils"
import { ActiveUserWidget } from "./sharedf/ActiveUserWidget"
import { SIDE_PANEL_WIDTH } from "./side_panel/width"
// import { go_antlr } from "./x_equations"



const map_state = (state: RootState) =>
({
    display_side_panel: state.controls.display_side_panel,
    animate_connections: state.display_options.animate_connections,
    network_functional: state.sync.network_functional,
    network_function_last_checked: state.sync.network_function_last_checked,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function App(props: Props)
{
    const classes = use_styles()

    useEffect(() =>
    {
        if (props.network_functional) return
        setTimeout(() => check_and_handle_connection_and_session(get_store()), 1000)
    }, [props.network_functional, props.network_function_last_checked])

    return (
        <ThemeProvider theme={DefaultTheme}>
            <CssBaseline />

            {!props.network_functional && <Modal
                title=""
                size="small"
                child={<Box>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Reconnecting...
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Last attempt: {date_to_string({ date: props.network_function_last_checked, time_resolution: "second" })}
                    </Typography>
                </Box>}
            />}

            <Box id="app" className={classes.root}>
                <AppBar elevation={1} id="header" position="fixed" className={"app_header " + classes.app_bar}>
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
                            <Box className={`${classes.toolbar_item}`}>
                                <ActiveCreatedAtFilterWarning />
                                <ActiveFilterWarning />
                                <ActiveCreationContextWarning />
                            </Box>
                            <Box className={`${classes.toolbar_item}`}><ActiveUserWidget /></Box>
                            <Box className={`${classes.toolbar_item}`}><SyncInfo /></Box>
                            <Box className={`${classes.toolbar_item}`}><StorageInfo /></Box>
                            <Box className={`${classes.toolbar_item}`}><UserInfo /></Box>
                            <Box className={`${classes.toolbar_item}`}><SidePanelOrMenuButton /></Box>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box
                    id="app_content"
                    component="div"
                    className={clsx(classes.content, {
                        [classes.content_with_open_side_panel]: props.display_side_panel,
                        animate_connections: props.animate_connections,
                    })}
                >
                    <MainAreaRouter />
                </Box>

                <Drawer
                    anchor="right"
                    className={classes.drawer}
                    open={props.display_side_panel}
                    variant="persistent"
                >
                    <Box component="aside" className={classes.side_panel} id="side_panel">
                        <Box id="side_panel_content" className={classes.side_panel_content}>
                            <AppMenuItemsContainer />
                            <SidePanel />
                        </Box>
                    </Box>
                </Drawer>
                <Box className={classes.help_popup}>
                    <HelpMenu />
                </Box>

            </Box>
        </ThemeProvider>
    )
}

export default connector(App) as FunctionalComponent<{}>



const use_styles = makeStyles(theme => ({
    root: {
        width: "100%", height: "100%",
        overflow: "hidden",
        display: "flex",
    },

    app_bar: {
        transition: theme.transitions.create(["all"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        zIndex: theme.zIndex.drawer + 1,
    },

    app_bar_with_open_side_panel: {
        // width: `calc(100% - ${SIDE_PANEL_WIDTH}px)`, maxWidth: `calc(100% - ${SIDE_PANEL_WIDTH}px)`,
        // marginRight: SIDE_PANEL_WIDTH,
        // transition: theme.transitions.create(["all"], {
        //     easing: theme.transitions.easing.easeOut,
        //     duration: theme.transitions.duration.enteringScreen,
        // }),
    },
    content: {
        width: "100%",
        // position: "relative",
        // zIndex: 1,
        flexGrow: 1,
        // flexShrink: 1,
        display: "flex",
        // flexDirection: "column", flexWrap: "nowrap",
        marginRight: -SIDE_PANEL_WIDTH,
        transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },

    content_with_open_side_panel: {
        marginRight: 0,
        transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },

    drawer: {
        width: SIDE_PANEL_WIDTH,
        flexShrink: 0,
    },

    side_panel: {
        backgroundColor: theme.palette.background.paper,
        width: SIDE_PANEL_WIDTH,
        position: "relative",
        paddingTop: 50,
    },

    side_panel_content: {
        marginTop: 10, padding: 10,
    },
    sidebar_toolbar: {
        flexGrow: 1,
        justifyContent: "flex-end"
    },
    toolbar: {
        flexGrow: 1,
        justifyContent: "space-between",
        flexWrap: "wrap",
        [theme.breakpoints.up("md")]: {
            flexWrap: "nowrap"
        }
    },
    toolbar_section: {
        display: "inherit",
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: "auto",
        marginRight: 5,
        "&:last-child": { marginRight: 0 },
        "&:empty": { display: "none" }
    },
    toolbar_item: {
        marginRight: 5,
        "&:last-child": { marginRight: 0 }
    },

    help_popup: {
        position: "relative",
        zIndex: theme.zIndex.drawer + 1,
    },

    small_full_width: {
        [theme.breakpoints.down("sm")]: {
            flexGrow: 0, flexShrink: 1, flexBasis: "100%",
            margin: 0,
        }
    },
    grow: { flexGrow: 1 },
    hide: { display: "none" },
    warning_icon: { color: theme.palette.warning.main }
}))


// ;(window as any).go_antlr = go_antlr
