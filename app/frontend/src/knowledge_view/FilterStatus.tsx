import { Box, Button, IconButton, makeStyles, Tooltip } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { FunctionalComponent, h } from "preact";
import { connect, ConnectedProps } from "react-redux";
import type { RootState } from "../state/State";
import type { TimeSliderEvent } from "../time_control/interfaces";
import WarningIcon from '@material-ui/icons/Warning';
import { useMemo } from "react";
import { get_wcomponent_time_slider_data } from "../time_control/prepare_data/wcomponent";
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors";

interface OwnProps
{
    events?: TimeSliderEvent[]
}

const map_state = (state: RootState) => ({
    created_at_ms: state.routing.args.created_at_ms,
    current_composed_knowledge_view: get_current_composed_knowledge_view_from_state(state),
    selected_component_id: state.routing.item_id,
    wcomponents: state.derived.wcomponents,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps

function _FilterStatus (props: Props)
{
    const { current_composed_knowledge_view, wcomponents  } = props
    if (!current_composed_knowledge_view) return null;

    let are_any_component_dates_within_filter:boolean = false;
    let how_many_components_are_visible:number = 0;

    const wcomponents_on_kv = useMemo(() =>
        wcomponents
        .filter(wc => !!current_composed_knowledge_view.composed_wc_id_map[wc.id])
        .filter(wc => wc.type !== "counterfactual")
    , [wcomponents, current_composed_knowledge_view])

    const { created_events, sim_events } = useMemo(() =>
        get_wcomponent_time_slider_data(wcomponents_on_kv)
    , [wcomponents_on_kv])

    created_events.forEach(e => {
        const filtered_created_at_datetime: Date = new Date(props.created_at_ms);
        const component_created_date = e.datetime;
        if (filtered_created_at_datetime.getTime() >= component_created_date.getTime()) {
            are_any_component_dates_within_filter = true;
            how_many_components_are_visible++
        }
    })
    const useStyles = makeStyles(theme => ({
        warning_button: {
            cursor:"help",
        },
        warning_icon: {
            color: theme.palette.warning.main
        },
    }))
    const classes = useStyles()
    return (!are_any_component_dates_within_filter) && (
        <Tooltip placement="top" title="WARNING: No components are visible due to created_at filter!">
            <IconButton
                className={classes.warning_button}
                component="span" disableRipple disableElevation
                size="small"
            >
                <WarningIcon className={classes.warning_icon} />
                {/* {how_many_components_are_visible} */}
            </IconButton>
        </Tooltip>
    )
}

export const FilterStatus = connector(_FilterStatus) as FunctionalComponent<OwnProps>
