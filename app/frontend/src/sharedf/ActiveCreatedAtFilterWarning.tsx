import { IconButton, makeStyles, Tooltip } from "@material-ui/core"
import FilterIcon from "@material-ui/icons/Filter"
import { FunctionalComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"



interface OwnProps {}

const map_state = (state: RootState) => ({
    created_at_ms: state.routing.args.created_at_ms,
    current_composed_knowledge_view: get_current_composed_knowledge_view_from_state(state),
    wcomponents: state.derived.wcomponents,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps

function _ActiveCreatedAtFilterWarning (props: Props)
{
    const { current_composed_knowledge_view, wcomponents } = props
    if (!current_composed_knowledge_view) return null

    const wcomponents_on_kv = useMemo(() =>
        wcomponents
        .filter(wc => !!current_composed_knowledge_view.composed_wc_id_map[wc.id])
        .filter(wc => wc.type !== "counterfactual")
    , [wcomponents, current_composed_knowledge_view])

    const components_excluded_by_created_at_datetime_filter = useMemo(() =>
        wcomponents_on_kv.filter(kv => get_created_at_ms(kv) > props.created_at_ms).length
    , [wcomponents_on_kv, props.created_at_ms])


    const classes = use_styles()


    return (components_excluded_by_created_at_datetime_filter > 0) && (
        <Tooltip placement="top" title={`WARNING: ${components_excluded_by_created_at_datetime_filter} components are invisible due to created at datetime filter!`}>
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
