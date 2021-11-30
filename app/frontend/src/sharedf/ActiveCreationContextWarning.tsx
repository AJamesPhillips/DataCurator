import { FunctionalComponent, h } from "preact"
import { IconButton, Tooltip } from "@material-ui/core"

import PhotoFilterIcon from "@material-ui/icons/PhotoFilter"
import type { RootState } from "../state/State"
import { connect, ConnectedProps } from "react-redux"
import { active_warning_styles } from "./active_warning_common"



interface OwnProps {}
const map_state = (state: RootState) => ({
    creation_context: state.creation_context,
    editing: !state.display_options.consumption_formatting,
})

const connector = connect(map_state)
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
                disableRipple disableElevation
                size="small"
            >
                <PhotoFilterIcon className={classes.warning_icon} />
            </IconButton>
        </Tooltip>
    )
}

export const ActiveCreationContextWarning = connector(_ActiveCreationContextWarning) as FunctionalComponent<OwnProps>
