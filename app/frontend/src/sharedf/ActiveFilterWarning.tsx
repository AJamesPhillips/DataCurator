import { FunctionalComponent, h } from "preact"
import { IconButton, Tooltip } from "@material-ui/core"
import { connect, ConnectedProps } from "react-redux"
import FilterNoneIcon from "@material-ui/icons/FilterNone"

import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import { active_warning_styles } from "./active_warning_common"



const map_state = (state: RootState) => ({
    apply_filter: state.filter_context.apply_filter,
})

const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _ActiveFilterWarning (props: Props)
{
    const { apply_filter } = props
    const classes = active_warning_styles()

    if (!apply_filter) return null


    return <Tooltip placement="top" title="A filter is in place which could result in components being hidden">
        <IconButton
            className={classes.warning_button}
            component="span"
            size="small"
            onClick={() => props.change_route({ route: "filter" })}
        >
            <FilterNoneIcon className={classes.warning_icon} />
        </IconButton>
    </Tooltip>
}

export const ActiveFilterWarning = connector(_ActiveFilterWarning) as FunctionalComponent<{}>
