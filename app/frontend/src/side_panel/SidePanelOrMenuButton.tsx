import { FunctionalComponent, h } from "preact"
import { IconButton } from "@material-ui/core"
import { connect, ConnectedProps } from "react-redux"
import CloseIcon from "@material-ui/icons/Close"
import MenuIcon from "@material-ui/icons/Menu"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
({
    display_side_panel: state.controls.display_side_panel,
})


const map_dispatch = {
    toggle_display_side_panel: ACTIONS.controls.toggle_display_side_panel,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _SidePanelOrMenuButton (props: Props)
{
    return <IconButton
        aria-label="open side panel"
        color="inherit"
        edge="end"
        onClick={props.toggle_display_side_panel}
        size="small"
    >
        {props.display_side_panel ? <CloseIcon /> : <MenuIcon />}
    </IconButton>
}

export const SidePanelOrMenuButton = connector(_SidePanelOrMenuButton) as FunctionalComponent<{}>
