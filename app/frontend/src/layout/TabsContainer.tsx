import { Box, Button, Menu, MenuItem } from "@material-ui/core"
import MenuIcon from '@material-ui/icons/Menu'
import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ALLOWED_ROUTES, ROUTE_TYPES } from "../state/routing/interfaces"
import type { RootState } from "../state/State"
import { Tab } from "./Tab"



interface OwnProps { }



const map_state = (state: RootState) => ({
    route: state.routing.route,
    editing: !state.display_options.consumption_formatting,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _TabsContainer (props: Props)
{
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const handleClick = (event: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }


    const [show_all_routes, set_show_all_routes] = useState(!!localStorage.getItem("show_all_tabs"))
    localStorage.setItem("show_all_tabs", show_all_routes ? "1" : "")


    let routes = ALLOWED_ROUTES
    if (!show_all_routes)
    {
        const hide_routes = new Set<ROUTE_TYPES>([
            "objects",
            "patterns",
            "perceptions",
            "statements",
            "about",
            "creation_context",
        ])
        routes = routes.filter(r => !hide_routes.has(r) || (props.editing && r === "creation_context"))
    }


    return (
        <Box mb={5} display="flex" flexDirection="column" alignItems="end">
            <Button onClick={handleClick} aria-controls="select_tab" fullWidth={true} aria-haspopup="true">
                <Box component="span" width={1} display="flex" flexDirection="row" flexWrap="nowrap" justifyContent="space-between" alignItems="start" alignContent="stretch">
                    <Box component="strong">{route_to_text(props.route)}</Box>
                    <MenuIcon  />
                </Box>
            </Button>
            <Menu anchorEl={anchorEl} id="select_tab" onClose={handleClose} open={Boolean(anchorEl)} keepMounted>
                {routes.map(route => <MenuItem onClick={handleClose}>
                    <Tab id={route} on_pointer_down={handleClose} />
                </MenuItem>)}

                <MenuItem onClick={() => set_show_all_routes(!show_all_routes)}>
                    {show_all_routes ? "Hide" : "Show"} all options
                </MenuItem>
            </Menu>
        </Box>
    )
}

export const TabsContainer = connector(_TabsContainer) as FunctionalComponent<OwnProps>



function route_to_text (route: ROUTE_TYPES)
{
    if (route === "wcomponents") return "Components"
    else return route.replaceAll("_", " ")
}
