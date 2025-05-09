import FilterIcon from "@mui/icons-material/Filter"
import { IconButton, Tooltip } from "@mui/material"
import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import { active_warning_styles } from "./active_warning_common"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const {
        wc_ids_excluded_by_created_at_datetime_filter,
        vap_set_number_excluded_by_created_at_datetime_filter = 0,
    } = get_current_composed_knowledge_view_from_state(state)?.filters || {}


    return {
        components: wc_ids_excluded_by_created_at_datetime_filter?.size || 0,
        vap_sets: vap_set_number_excluded_by_created_at_datetime_filter,
    }
}

const map_dispatch = {
    set_display_time_sliders: ACTIONS.controls.set_display_time_sliders,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _ActiveCreatedAtFilterWarning (props: Props)
{
    const { components, vap_sets } = props
    if ((components + vap_sets) === 0) return null

    const classes = active_warning_styles()

    let title = components ? `${components} components are invisible ` : ""
    if (components && vap_sets) title += "and "
    title += vap_sets ? `${vap_sets} predictions are invisible ` : ""

    title += `due to created at datetime filter`

    return (
        <Tooltip placement="top" title={title}>
            <IconButton
                className={classes.warning_button}
                component="span"
                onClick={() => props.set_display_time_sliders(true)}
                size="small"
            >
                <FilterIcon className={classes.warning_icon} />
            </IconButton>
        </Tooltip>
    )
}

export const ActiveCreatedAtFilterWarning = connector(_ActiveCreatedAtFilterWarning) as FunctionalComponent<OwnProps>
