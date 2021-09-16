import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { ButtonGroup, IconButton } from "@material-ui/core"
import EditIcon from "@material-ui/icons/Edit"
import PresentToAllIcon from "@material-ui/icons/PresentToAll"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { invert_disabled_appearance } from "../ui_themes/invert_disabled"



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
    const classes = invert_disabled_appearance();
    return (
        <ButtonGroup
            size="small"
            value={props.presenting ? "presenting" : "editing"}
        >
            <IconButton
                className={classes.inverse_disabled}
                disabled={(!props.presenting) ? true : false }
                onClick={props.toggle_consumption_formatting}
                value="editing"
            >
                <EditIcon color="inherit" />
            </IconButton>
            <IconButton
                className={`${classes.inverse_disabled} HI`}
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
