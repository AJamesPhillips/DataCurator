import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { Box, ButtonGroup, Button, Toolbar, makeStyles, Collapse } from "@material-ui/core"

import "./ContentControls.scss"
import { MoveToWComponentButton } from "../../canvas/MoveToWComponentButton"
import { TimeResolutionOptions } from "../../display_options/TimeResolutionOptions"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { TimeSlider } from "../../time_control/TimeSlider"
import type { TimeSliderEvent } from "../../time_control/interfaces"
import { invert_disabled_appearance } from "../../ui_themes/invert_disabled"
import { ActiveCreatedAtFilterWarning } from "../../sharedf/ActiveCreatedAtFilterWarning"
import { ToggleDatetimeMarkers } from "./ToggleDatetimeMarkers"



interface OwnProps
{
    created_events: TimeSliderEvent[]
    sim_events: TimeSliderEvent[]
}


const map_state = (state: RootState) =>
{
    return {
        linked_datetime_sliders: state.controls.linked_datetime_sliders,
        display_by_simulated_time: state.display_options.display_by_simulated_time,
        display_time_sliders: state.controls.display_time_sliders,
        editing: !state.display_options.consumption_formatting,
        created_at_ms: state.routing.args.created_at_ms,
    }
}


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
    const [allow_drawing_attention, set_allow_drawing_attention] = useState(true)

    const invert_classes = invert_disabled_appearance()
    const { created_events, sim_events } = props

    const display_sliders = props.editing || props.display_time_sliders

    const classes = use_styles()


    return (
        <Box p={2} mb={2} borderTop={1} borderColor="primary.main" position="relative">
            <Collapse in={display_sliders}>
                <Box className={classes.drawer_content}>
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
                </Box>
            </Collapse>
            <Toolbar className={classes.toolbar} variant="dense">
                <MoveToWComponentButton
                    allow_drawing_attention={allow_drawing_attention}
                    have_finished_drawing_attention={() => set_allow_drawing_attention(false)}
                />
                <ActiveCreatedAtFilterWarning />
                <Box component="label" title={props.editing ? "Time sliders always shown whilst editing" : ""}>
                    <Button
                        variant="contained"
                        disableElevation
                        disabled={props.editing}
                        onClick={() => props.set_display_time_sliders(!props.display_time_sliders)}
                    >
                        {display_sliders ? "Hide" : "Show"} time sliders
                    </Button>
                </Box>

                <Box component="label">
                    {/* <Box component="span" pr={1}>Time Resolution: </Box> */}
                    <TimeResolutionOptions  />
                </Box>

                <ToggleDatetimeMarkers />

                <Box component="label">
                    <ButtonGroup
                        disableElevation
                        variant="contained"
                        value={props.display_by_simulated_time}
                    >
                        <Button
                            onClick={() => props.set_display_by_simulated_time(true)}
                            aria-label="Display by simulated time"
                            className={invert_classes.inverse_disabled}
                            disabled={props.display_by_simulated_time}
                        >
                            Time
                        </Button>
                        <Button
                            onClick={() => props.set_display_by_simulated_time(false)}
                            aria-label="Display by relationships"
                            className={invert_classes.inverse_disabled}
                            disabled={!props.display_by_simulated_time}
                        >
                            Relationships
                        </Button>
                    </ButtonGroup>
                </Box>
            </Toolbar>
        </Box>
    )
}

export const ContentControls = connector(_ContentControls) as FunctionalComponent<OwnProps>



const use_styles = makeStyles(theme => ({
    toolbar: {
        justifyContent: "space-between",
    },
    drawer_content: {
        display: "flex", flexDirection: "row",
        alignItems: "center", alignContent: "center",
    },
    warning_icon: {
        color: theme.palette.warning.main
    },
}))
