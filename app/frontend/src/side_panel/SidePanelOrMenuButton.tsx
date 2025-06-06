import CloseIcon from "@mui/icons-material/Close"
import MenuIcon from "@mui/icons-material/Menu"
import { IconButton } from "@mui/material"
import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
({
    display_side_panel: state.controls.display_side_panel,
})


const map_dispatch = {
    set_or_toggle_display_side_panel: ACTIONS.controls.set_or_toggle_display_side_panel,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _SidePanelOrMenuButton (props: Props)
{
    return <IconButton
        aria-label="open side panel"
        color="inherit"
        edge="end"
        onClick={() => props.set_or_toggle_display_side_panel()}
        size="small"
    >
        {props.display_side_panel ? <CloseIcon /> : <MenuIcon />}
    </IconButton>
}

export const SidePanelOrMenuButton = connector(_SidePanelOrMenuButton) as FunctionalComponent
