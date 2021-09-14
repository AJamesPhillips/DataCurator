import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Box, ButtonGroup, Button, Toolbar, makeStyles, Tooltip } from "@material-ui/core"
import { MoveToWComponentButton } from "../../canvas/MoveToWComponentButton"
import { TimeResolutionOptions } from "../../display_options/TimeResolutionOptions"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { TimeSlider } from "../../time_control/TimeSlider"
import type { TimeSliderEvent } from "../../time_control/interfaces"
import { invertDisabledAppearance } from "../../ui_themes/invert_disabled"
import { Alert } from "@material-ui/lab"
import WarningIcon from '@material-ui/icons/Warning';

interface OwnProps
{
    move_to_component_id: string | undefined
    created_events: TimeSliderEvent[]
    sim_events: TimeSliderEvent[]
}

const map_state = (state: RootState) => ({
    linked_datetime_sliders: state.controls.linked_datetime_sliders,
    display_by_simulated_time: state.display_options.display_by_simulated_time,
    display_time_sliders: state.controls.display_time_sliders,
    editing: !state.display_options.consumption_formatting,
    created_at_ms: state.routing.args.created_at_ms,
})

const map_dispatch = {
    change_display_at_created_datetime: ACTIONS.display_at_created_datetime.change_display_at_created_datetime,
    change_display_at_sim_datetime: ACTIONS.display_at_sim_datetime.change_display_at_sim_datetime,
    toggle_linked_datetime_sliders: ACTIONS.controls.toggle_linked_datetime_sliders,
    set_display_time_sliders: ACTIONS.controls.set_display_time_sliders,
    set_display_by_simulated_time: ACTIONS.display.set_display_by_simulated_time,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _ContentControls (props: Props)
{
    const intvert_classes = invertDisabledAppearance();
    const { created_events, sim_events, move_to_component_id } = props
    const set_knowledge_view_type = (e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) => {
        const display_by_simulated_time = JSON.parse(e.currentTarget.value);
        props.set_display_by_simulated_time({ display_by_simulated_time });
    }


    const display_sliders = props.editing || props.display_time_sliders
    let are_any_component_dates_within_filter:boolean = false;
    let how_many_components_are_visible:number = 0;

    created_events.forEach(e => {
        const filtered_created_at_datetime: Date = new Date(props.created_at_ms);
        const component_created_date = e.datetime;
        if (filtered_created_at_datetime.getTime() >= component_created_date.getTime()) {
            are_any_component_dates_within_filter = true;
            how_many_components_are_visible++
        }
    })
    const useStyles = makeStyles(theme => ({
        toolbar: {
            justifyContent:"space-between"
        },
    }))
    const classes = useStyles()
    return (
        <Box p={2} mb={2} borderTop={1} borderColor="primary.main">
            <Toolbar className={classes.toolbar} variant="dense">
                <Box>
                    <MoveToWComponentButton wcomponent_id={move_to_component_id} />
                </Box>
                {(!are_any_component_dates_within_filter) && (
                    <Tooltip placement="top" title="WARNING: No components are visible due to create_at filter!">
                        <Alert severity="warning" icon={<WarningIcon />}>
                            {how_many_components_are_visible}
                        </Alert>
                    </Tooltip>
                )}
                <Box component="label" title={props.editing ? "Time sliders always shown whilst editing" : ""}>
                    <Button
                        disabled={props.editing}
                        onClick={() => props.set_display_time_sliders(!props.display_time_sliders)}
                    >
                        {display_sliders ? "Hide" : "Show"} time sliders
                    </Button>
                </Box>

                <Box component="label">
                    {/* <Box component="span" pr={1}>Time Resolution:</Box> */}
                    <TimeResolutionOptions  />
                </Box>

                <Box component="label">
                    <ButtonGroup
                        disableElevation
                        variant="contained"
                        value={props.display_by_simulated_time}
                    >
                        <Button
                            value={true}
                            onClick={set_knowledge_view_type}
                            aria-label="Display by simulated time"
                            className={intvert_classes.inverse_disabled}
                            disabled={props.display_by_simulated_time}
                        >
                            Time
                        </Button>
                        <Button
                            value={false}
                            onClick={set_knowledge_view_type}
                            aria-label="Display by relationships"
                            className={intvert_classes.inverse_disabled}
                            disabled={!props.display_by_simulated_time}
                        >
                            Relationships
                        </Button>
                    </ButtonGroup>
                </Box>
            </Toolbar>

            {display_sliders && <Box
                display="flex" flexDirection="row" alignItems="center" alignContent="center"
            >
                <Button onClick={() => props.toggle_linked_datetime_sliders()}>
                    {props.linked_datetime_sliders ? "Unlink" : "Link"}
                </Button>
                <Box flexGrow={1}>
                    <TimeSlider
                        events={created_events}
                        get_handle_ms={state => state.routing.args.created_at_ms}
                        change_handle_ms={ms => props.change_display_at_created_datetime({ ms })}
                        data_set_name="content_controls_created_at_datetimes"
                        title="Created at"
                    />
                    <TimeSlider
                        events={sim_events}
                        get_handle_ms={state => state.routing.args.sim_ms}
                        change_handle_ms={ms => props.change_display_at_sim_datetime({ ms })}
                        data_set_name="content_controls_sim_datetimes"
                        title="Simulation"
                    />
                </Box>
            </Box>}
        </Box>
    )
}

export const ContentControls = connector(_ContentControls) as FunctionalComponent<OwnProps>
