import { IconButton, makeStyles, Tooltip } from "@material-ui/core"
import FilterIcon from "@material-ui/icons/Filter"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"



interface OwnProps {}

const map_state = (state: RootState) => ({
    component_number_excluded_by_created_at_datetime_filter: get_current_composed_knowledge_view_from_state(state)?.filters.wc_ids_excluded_by_created_at_datetime_filter.size,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps

function _ActiveCreatedAtFilterWarning (props: Props)
{
    const { component_number_excluded_by_created_at_datetime_filter } = props
    if (!component_number_excluded_by_created_at_datetime_filter) return null

    const classes = use_styles()


    return (
        <Tooltip placement="top" title={`${component_number_excluded_by_created_at_datetime_filter} components are invisible due to created at datetime filter`}>
            <IconButton
                className={classes.warning_button}
                component="span"
                disableRipple disableElevation
                size="small"
            >
                <FilterIcon className={classes.warning_icon} />
            </IconButton>
        </Tooltip>
    )
}

export const ActiveCreatedAtFilterWarning = connector(_ActiveCreatedAtFilterWarning) as FunctionalComponent<OwnProps>



const use_styles = makeStyles(theme => ({
    warning_button: { cursor: "help" },
    warning_icon: { color: theme.palette.warning.main }
}))
