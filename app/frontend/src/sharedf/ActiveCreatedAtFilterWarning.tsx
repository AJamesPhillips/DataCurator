import { IconButton, Tooltip } from "@material-ui/core"
import FilterIcon from "@material-ui/icons/Filter"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import { active_warning_styles } from "./active_warning_common"
import { ACTIONS } from "../state/actions"



interface OwnProps {}

const map_state = (state: RootState) => ({
    component_number_excluded_by_created_at_datetime_filter: get_current_composed_knowledge_view_from_state(state)?.filters.wc_ids_excluded_by_created_at_datetime_filter.size,
})

const map_dispatch = {
    set_display_time_sliders: ACTIONS.controls.set_display_time_sliders,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _ActiveCreatedAtFilterWarning (props: Props)
{
    const { component_number_excluded_by_created_at_datetime_filter } = props
    if (!component_number_excluded_by_created_at_datetime_filter) return null

    const classes = active_warning_styles()


    return (
        <Tooltip
            placement="top"
            title={`${component_number_excluded_by_created_at_datetime_filter} components are invisible due to created at datetime filter`}
        >
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
