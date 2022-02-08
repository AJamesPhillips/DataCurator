import { FunctionalComponent, h } from "preact"
import { IconButton, makeStyles, Tooltip } from "@material-ui/core"
import FilterTiltShift from "@material-ui/icons/FilterTiltShift"

import type { RootState } from "../state/State"
import { connect, ConnectedProps } from "react-redux"
import { active_warning_styles } from "./active_warning_common"
import { ACTIONS } from "../state/actions"



interface OwnProps {}
const map_state = (state: RootState) => ({
    presenting: state.display_options.consumption_formatting,
    focused_mode: state.display_options.focused_mode,
})

const map_dispatch = {
    set_or_toggle_focused_mode: ACTIONS.display.set_or_toggle_focused_mode,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _ActiveFocusedMode (props: Props)
{
    const { presenting, focused_mode } = props
    const title = presenting
        ? (
            focused_mode
            ? "WARNING: Focused Mode is active, unselected components will be almost invisible"
            : "Activate focused mode"
        ) : "Focused mode only available when presenting"
    const classes = (presenting && focused_mode) ? active_warning_styles() : inactive_warning_styles()

    return <Tooltip placement="top" title={title}>
        <span>
            <IconButton
                // className={classes.warning_button}
                component="span"
                size="medium"
                disabled={!presenting}
                onClick={() => props.set_or_toggle_focused_mode()}
            >
                <FilterTiltShift className={classes.warning_icon} />
            </IconButton>
        </span>
    </Tooltip>
}

export const ActiveFocusedMode = connector(_ActiveFocusedMode) as FunctionalComponent<OwnProps>



const inactive_warning_styles = makeStyles(theme => ({
    // warning_button: {},
    warning_icon: { color: theme.palette.primary.main }
}))
