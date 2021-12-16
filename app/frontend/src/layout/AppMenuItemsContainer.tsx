import { Box, Button, Menu, MenuItem as MaterialMenuItem } from "@material-ui/core"
import MenuIcon from "@material-ui/icons/Menu"
import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import { ALLOWED_ROUTES, ROUTE_TYPES } from "../state/routing/interfaces"
import type { RootState } from "../state/State"
import { AppMenuItem, CustomisableAppMenuItem } from "./AppMenuItem"
import { route_to_text } from "./route_to_text"



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
    const handle_menu_icon_click = (event: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) => {
        setAnchorEl(event.currentTarget)
    }
    const handle_menu_close = () => {
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


    return (
        <div>
            <div style={{ display: "flex", flexDirection: "row" }}>
                <Button style={{ display: "flex", flex: 1 }}>
                    <b
                        style={{ width: "100%", display: "flex" }}
                        onClick={() =>
                        {
                            props.change_route({ route: props.route, item_id: null, sub_route: null })
                        }}
                    >
                        {route_to_text(props.route)}
                    </b>
                </Button>
                <Button
                    aria-controls="select_tab"
                    aria-haspopup="true"
                    style={{ display: "flex", flex: 1, justifyContent: "end" }}
                    onClick={handle_menu_icon_click}
                >
                    <MenuIcon />
                </Button>
            </div>

            <Menu anchorEl={anchorEl} id="select_tab" onClose={handle_menu_close} open={Boolean(anchorEl)} keepMounted>
                {routes.map(route => <AppMenuItem id={route} on_pointer_down={handle_menu_close} />)}
                <CustomisableAppMenuItem
                    on_pointer_down={() =>
                    {
                        handle_menu_close()
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
        </div>
    )
}

export const AppMenuItemsContainer = connector(_AppMenuItemsContainer) as FunctionalComponent<OwnProps>
