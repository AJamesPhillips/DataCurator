import { FunctionalComponent, h } from "preact"
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
import { get_current_composed_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import { screen_height, screen_width } from "../../state/display_options/display"
import { SCALE_BY } from "../../canvas/zoom_utils"



interface OwnProps
{
    move_to_component_id: string | undefined
    created_events: TimeSliderEvent[]
    sim_events: TimeSliderEvent[]
}

let displayed_pulse_circle_on_move_to_components = true
const map_state = (state: RootState) =>
{
    let nodes_on_screen: boolean | undefined = undefined
    if (displayed_pulse_circle_on_move_to_components)
    {
        nodes_on_screen = calculate_if_nodes_on_screen(state)
    }

    return {
        linked_datetime_sliders: state.controls.linked_datetime_sliders,
        display_by_simulated_time: state.display_options.display_by_simulated_time,
        display_time_sliders: state.controls.display_time_sliders,
        editing: !state.display_options.consumption_formatting,
        created_at_ms: state.routing.args.created_at_ms,
        nodes_on_screen,
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
    const invert_classes = invert_disabled_appearance()
    const { created_events, sim_events, move_to_component_id, nodes_on_screen } = props

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
                <Box>
                    <MoveToWComponentButton wcomponent_id={move_to_component_id} />
                    <div
                        className={(!move_to_component_id || !displayed_pulse_circle_on_move_to_components || nodes_on_screen) ? "" : "pulsating_circle"}
                        ref={e => setTimeout(() =>
                        {
                            e?.classList.remove("pulsating_circle")
                            displayed_pulse_circle_on_move_to_components = false
                        }, 10000)}
                    />
                </Box>
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



function calculate_if_nodes_on_screen (state: RootState)
{
    let nodes_on_screen: boolean | undefined = undefined
    const composed_kv = get_current_composed_knowledge_view_from_state(state)

    if (composed_kv)
    {
        const { composed_wc_id_map, wc_ids_by_type } = composed_kv
        const { x, y, zoom } = state.routing.args
        const max_x = x + (screen_width() * (zoom / SCALE_BY))
        const max_y = y - (screen_height() * (zoom / SCALE_BY))

        nodes_on_screen = !!Array.from(wc_ids_by_type.any_node).find(id => {
            const position = composed_wc_id_map[id]

            // console.group(state.specialised_objects.wcomponents_by_id[id]?.title, position?.left, position?.top)

            if (!position) return false
            const { left, top } = position
            // console .log("left >= x", left >= x, `${left} >= ${x}`)
            // console .log("left <= max_x", left <= max_x, `${left} <= ${max_x}`)
            // console .log("-top <= y", -top <= y, `${-top} <= ${y}`)
            // console .log("-top >= max_y", -top >= max_y, `${-top} >= ${max_y}`)
            // console.groupEnd()

            return left >= x && left <= max_x && -top <= y && -top >= max_y
        })
    }

    return nodes_on_screen
}
