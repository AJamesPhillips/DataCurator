import DoubleArrowIcon from "@mui/icons-material/DoubleArrow"
import TuneIcon from "@mui/icons-material/Tune"
import { Box, Collapse, IconButton, Toolbar, Tooltip } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import { FunctionalComponent } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { MoveToWComponentButton } from "../../canvas/MoveToWComponentButton"
import { ActiveCreatedAtFilterWarning } from "../../sharedf/ActiveCreatedAtFilterWarning"
import { ACTIONS } from "../../state/actions"
import { get_actually_display_time_sliders } from "../../state/controls/accessors"
import { experimental_features } from "../../state/display_options/persistance"
import type { RootState } from "../../state/State"
import type { TimeSliderEvent } from "../../time_control/interfaces"
import { TimeSlider } from "../../time_control/TimeSlider"
import { invert_disabled_appearance } from "../../ui_themes/invert_disabled"
import { ActiveFilterWarning } from "../ActiveFilterWarning"
import { ActiveFocusedMode } from "../ActiveFocusedMode"
import "./ContentControls.scss"
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
        actually_display_time_sliders: get_actually_display_time_sliders(state),
        editing: !state.display_options.consumption_formatting,
        animate_connections: state.display_options.animate_connections,
        created_at_ms: state.routing.args.created_at_ms,
    }
}


const map_dispatch = {
    change_display_at_created_datetime: ACTIONS.display_at_created_datetime.change_display_at_created_datetime,
    change_display_at_sim_datetime: ACTIONS.display_at_sim_datetime.change_display_at_sim_datetime,
    toggle_linked_datetime_sliders: ACTIONS.controls.toggle_linked_datetime_sliders,
    set_display_time_sliders: ACTIONS.controls.set_display_time_sliders,
    set_display_by_simulated_time: ACTIONS.display.set_display_by_simulated_time,
    set_or_toggle_animate_connections: ACTIONS.display.set_or_toggle_animate_connections,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _ContentControls (props: Props)
{
    const [allow_drawing_attention, set_allow_drawing_attention] = useState(true)

    const invert_classes = invert_disabled_appearance()
    const { created_events, sim_events } = props

    const classes = use_styles()


    return (
        <Box p={2} mb={2} borderTop={1} borderColor="primary.main" position="relative">
            <Collapse in={props.actually_display_time_sliders}>
                <Box className={classes.drawer_content}>
                    {/* Have disabled this link button for now (2023-01-22) as do not use it
                        and potential use case is not documented */}
                    {/* <Button
                        onClick={() => props.toggle_linked_datetime_sliders()}
                        title={props.linked_datetime_sliders
                            ? "Simulation and created at datetime values are linked (click to unlink)"
                            : "Simulation and created at datetimes change independently (click to link)"
                        }
                    >
                        {props.linked_datetime_sliders ? "Unlink" : "Link"}
                    </Button> */}
                    <Box flexGrow={1}>
                        {/* Hide these time sliders until they're actually needed
                        because are not optimised for knowledge views with many
                        wcomponents */}
                        {props.actually_display_time_sliders && <>
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
                        </>}
                    </Box>
                </Box>
            </Collapse>
            <Toolbar className={classes.toolbar} variant="dense">
                <Box className={classes.move_to_button_and_warnings}>
                    <MoveToWComponentButton
                        allow_drawing_attention={allow_drawing_attention}
                        have_finished_drawing_attention={() => set_allow_drawing_attention(false)}
                        disable_if_not_present={false}
                    />
                    <ActiveFocusedMode />
                    <ActiveCreatedAtFilterWarning />
                    <ActiveFilterWarning />
                </Box>

                {experimental_features.get_state().enable_align_components_on_x_by_time &&
                    <ToggleDatetimeMarkers />
                }


                <div>
                    <Tooltip
                        placement="top"
                        title={props.animate_connections ? "Stop animating connections" : "Animate connections"}
                    >
                        <IconButton
                            component="span"
                            size="medium"
                            onClick={() => props.set_or_toggle_animate_connections()}
                        >
                            <DoubleArrowIcon style={{ color: props.animate_connections ? "rgb(25, 118, 210)" : "" }} />
                        </IconButton>
                    </Tooltip>


                    <Tooltip
                        placement="top"
                        title={props.display_time_sliders ? "Hide time sliders" : "Show time sliders"}
                    >
                        <IconButton
                            component="span"
                            size="medium"
                            onClick={() => props.set_display_time_sliders(!props.display_time_sliders)}
                        >
                            <TuneIcon />
                        </IconButton>
                    </Tooltip>
                </div>


                {/* <Box component="label">
                    {/ * <Box component="span" pr={1}>Time Resolution: </Box> * /}
                    <TimeResolutionOptions  />
                </Box> */}

                {/* <Box component="label">
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
                </Box> */}
            </Toolbar>
        </Box>
    )
}

export const ContentControls = connector(_ContentControls) as FunctionalComponent<OwnProps>



const use_styles = makeStyles(theme => ({
    toolbar: {
        justifyContent: "space-between",
    },
    move_to_button_and_warnings: {
        display: "flex",
        flexDirection: "row",
    },
    drawer_content: {
        display: "flex", flexDirection: "row",
        alignItems: "center", alignContent: "center",
    },
    warning_icon: {
        color: theme.palette.warning.main
    },
}))
