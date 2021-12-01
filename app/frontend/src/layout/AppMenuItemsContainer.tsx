import { Box, Button, Menu, MenuItem as MaterialMenuItem } from "@material-ui/core"
import MenuIcon from "@material-ui/icons/Menu"
import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import { ALLOWED_ROUTES, ROUTE_TYPES } from "../state/routing/interfaces"
import type { RootState } from "../state/State"
import { AppMenuItem, CustomisableAppMenuItem } from "./AppMenuItem"



interface OwnProps { }



const map_state = (state: RootState) => ({
    route: state.routing.route,
    editing: !state.display_options.consumption_formatting,
})

const map_dispatch = {
    set_show_help_menu: ACTIONS.display.set_show_help_menu,
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


const hide_routes = new Set<ROUTE_TYPES>([
    "objects",
    "patterns",
    "perceptions",
    "statements",
])
const base_allowed_routes = ALLOWED_ROUTES.filter(r => !hide_routes.has(r))


function _AppMenuItemsContainer (props: Props)
{
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const handleClick = (event: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }
    const [show_all_routes, set_show_all_routes] = useState(false)

    let routes = base_allowed_routes
    if (!show_all_routes)
    {
        const hide_routes = new Set<ROUTE_TYPES>([
            "about",
            "creation_context",
        ])
        routes = routes.filter(r => !hide_routes.has(r) || (props.editing && r === "creation_context"))
    }

    // @TODO: Come back to this. We should NOT need the inline styles on MenuItems below
    return (
        <Box mb={5} display="flex" flexDirection="column" alignItems="end">
            <Button aria-controls="select_tab" fullWidth={true} aria-haspopup="true">
                <Box component="span" width={1} display="flex" flexDirection="row" flexWrap="nowrap" justifyContent="space-between" alignItems="start" alignContent="stretch">
                    <Box component="strong" onClick={() =>
                    {
                        props.change_route({ route: props.route, item_id: null, sub_route: null })
                    }}>
                        {route_to_text(props.route)}
                    </Box>
                    <MenuIcon onClick={handleClick} />
                </Box>
            </Button>
            <Menu anchorEl={anchorEl} id="select_tab" onClose={handleClose} open={Boolean(anchorEl)} keepMounted>
                {routes.map(route => <AppMenuItem id={route} on_pointer_down={handleClose} />)}
                <CustomisableAppMenuItem
                    on_pointer_down={() =>
                    {
                        handleClose()
                        props.set_show_help_menu({ show: true })
                    }}
                >
                    Help
                </CustomisableAppMenuItem>

                <MaterialMenuItem
                    onClick={() => set_show_all_routes(!show_all_routes)}
                    style={{ display: "flex", justifyContent: "flex-start", padding: "0.5em" }}
                >
                    {show_all_routes ? "Hide extra" : "Show all"} options
                </MaterialMenuItem>
            </Menu>
        </Box>
    )
}

export const AppMenuItemsContainer = connector(_AppMenuItemsContainer) as FunctionalComponent<OwnProps>



function route_to_text (route: ROUTE_TYPES)
{
    if (route === "wcomponents") return "Components"
    else return route.replaceAll("_", " ")
}
