import { IconButton, Tooltip } from "@mui/material"
import { FunctionalComponent } from "preact"

import PhotoFilterIcon from "@mui/icons-material/PhotoFilter"
import { connect, ConnectedProps } from "react-redux"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { active_warning_styles } from "./active_warning_common"



interface OwnProps {}
const map_state = (state: RootState) => ({
    creation_context: state.creation_context,
    editing: !state.display_options.consumption_formatting,
})

const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
    set_or_toggle_display_side_panel: ACTIONS.controls.set_or_toggle_display_side_panel,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _ActiveCreationContextWarning (props: Props)
{
    const { creation_context, editing } = props

    const classes = active_warning_styles()


    return (creation_context.use_creation_context && editing) && (
        <Tooltip placement="top" title="WARNING: Creation Context is active, which can result in components being created with incorrect information!">
            <IconButton
                className={classes.warning_button}
                component="span"
                size="small"
                onClick={() =>
                {
                    props.set_or_toggle_display_side_panel(true)
                    props.change_route({ route: "creation_context" })
                }}
            >
                <PhotoFilterIcon className={classes.warning_icon} />
            </IconButton>
        </Tooltip>
    )
}

export const ActiveCreationContextWarning = connector(_ActiveCreationContextWarning) as FunctionalComponent<OwnProps>
