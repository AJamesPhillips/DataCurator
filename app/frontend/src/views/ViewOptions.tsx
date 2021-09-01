import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { ButtonGroup, IconButton } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit"
import PresentToAllIcon from "@material-ui/icons/PresentToAll"

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
    return (
        // @TODO: This might be better as a switch component
        <ButtonGroup
            size="small"
            value={props.presenting ? "presenting" : "editing"}
        >
            <IconButton
                disabled={(!props.presenting) ? true : false }
                onClick={props.toggle_consumption_formatting}
                value="editing"
            >
                <EditIcon color="inherit" />
            </IconButton>
            <IconButton
                disabled={(props.presenting) ? true : false }
                onClick={props.toggle_consumption_formatting}
                value="presenting"
            >
                <PresentToAllIcon />
            </IconButton>
        </ButtonGroup>
    )
}

export const ViewOptions = connector(_ViewOptions) as FunctionalComponent<{}>
