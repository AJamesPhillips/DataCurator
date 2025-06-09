import MenuIcon from "@mui/icons-material/Menu"
import { Button, Menu } from "@mui/material"
import { FunctionalComponent } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import { ALLOWED_ROUTES } from "../state/routing/interfaces"
import type { RootState } from "../state/State"
import { AppMenuItem, CustomisableAppMenuItem } from "./AppMenuItem"
import { route_to_text } from "./route_to_text"



const map_state = (state: RootState) => ({
    route: state.routing.route,
    editing: !state.display_options.consumption_formatting,
})

const map_dispatch = {
    set_show_help_menu: ACTIONS.display.set_show_help_menu,
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _AppMenuItemsContainer (props: Props)
{
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    const handle_menu_close = () => {
        setAnchorEl(null)
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
                    onClick={e => setAnchorEl(e.currentTarget)}
                >
                    <MenuIcon />
                </Button>
            </div>

            <Menu anchorEl={anchorEl} id="select_tab" onClose={handle_menu_close} open={Boolean(anchorEl)} keepMounted>
                {ALLOWED_ROUTES.map(route => <AppMenuItem id={route} on_pointer_down={handle_menu_close} />)}
                <CustomisableAppMenuItem
                    on_pointer_down={() =>
                    {
                        handle_menu_close()
                        props.set_show_help_menu({ show: true })
                    }}
                >
                    Help
                </CustomisableAppMenuItem>
            </Menu>
        </div>
    )
}

export const AppMenuItemsContainer = connector(_AppMenuItemsContainer) as FunctionalComponent
