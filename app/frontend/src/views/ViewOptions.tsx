import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import ToggleButton from "@material-ui/lab/ToggleButton"
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup"
import EditIcon from "@material-ui/icons/Edit"
import PresentToAllIcon from "@material-ui/icons/PresentToAll"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { Box } from "@material-ui/core"



const map_state = (state: RootState) =>
{
    return {
        presenting: state.display_options.consumption_formatting,
    }
}

const map_dispatch = {
    toggle_consumption_formatting: ACTIONS.display.toggle_consumption_formatting,
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _ViewOptions (props: Props)
{
    return <ToggleButtonGroup
        size="small"
        exclusive
        onChange={props.toggle_consumption_formatting}
        value={props.presenting ? "presenting" : "editing"}
        aria-label="text formatting"
    >
        <ToggleButton value="editing" aria-label="Editing">
            <EditIcon />
        </ToggleButton>
        <ToggleButton value="presenting" aria-label="Presenting">
            <PresentToAllIcon />
        </ToggleButton>
    </ToggleButtonGroup>
}

export const ViewOptions = connector(_ViewOptions) as FunctionalComponent<{}>
