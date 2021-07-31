import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Box } from "@material-ui/core"
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab"
import { MoveToWComponentButton } from "../../canvas/MoveToWComponentButton"
import { TimeResolutionOptions } from "../../display_options/TimeResolutionOptions"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { TimeSlider } from "../../time_control/TimeSlider"
import { Button } from "../Button"
import type { TimeSliderEvent } from "../../time_control/interfaces"



interface OwnProps
{
    move_to_component_id: string | undefined
    created_events: TimeSliderEvent[]
    sim_events: TimeSliderEvent[]
}


const map_state = (state: RootState) => ({
    linked_datetime_sliders: state.controls.linked_datetime_sliders,
    display_by_simulated_time: state.display_options.display_by_simulated_time,
    display_created_at_time_slider: state.controls.display_created_at_time_slider,
    editing: !state.display_options.consumption_formatting,
})

const map_dispatch = {
    change_display_at_created_datetime: ACTIONS.display_at_created_datetime.change_display_at_created_datetime,
    change_display_at_sim_datetime: ACTIONS.display_at_sim_datetime.change_display_at_sim_datetime,
    toggle_linked_datetime_sliders: ACTIONS.controls.toggle_linked_datetime_sliders,
    set_display_by_simulated_time: ACTIONS.display.set_display_by_simulated_time,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ContentControls (props: Props)
{
    const { created_events, sim_events, move_to_component_id } = props

    return (
        <Box p={2} mb={2} borderTop={1} borderColor="primary.main">
            {/* <div style={{ width: 40, display: "inline-block" }}></div> */}

            <Box mb={2}  display="flex" flexDirection="row" justifyContent="space-between">
                <Box>
                    <MoveToWComponentButton wcomponent_id={move_to_component_id} />
                </Box>

                <Box component="label">
                    {/* <Box component="span" pr={1}>Time Resolution:</Box> */}
                    <TimeResolutionOptions  />
                </Box>

                <Box component="label">
                    {/* <Box component="span" pr={1}>Display by:</Box> */}
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        onChange={(e: h.JSX.TargetedMouseEvent<HTMLButtonElement>) =>
                        {
                            const display_by_simulated_time = JSON.parse(e.currentTarget.value)
                            props.set_display_by_simulated_time({ display_by_simulated_time })
                        }}
                        value={props.display_by_simulated_time}
                        aria-label="text formatting"
                    >
                        <ToggleButton value={true} aria-label="Display by simulated time">
                            Time
                        </ToggleButton>
                        <ToggleButton value={false} aria-label="Display by relationships">
                            Relationships
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>
            <Box display="flex" flexDirection="row" alignItems="center" alignContent="center">
                    {(props.editing || props.display_created_at_time_slider) && <Button
                        onClick={() => props.toggle_linked_datetime_sliders()}
                    >{props.linked_datetime_sliders ? "Unlink" : "Link"}</Button>}
                <Box flexGrow={1}>
                    {(props.editing || props.display_created_at_time_slider) && <TimeSlider
                        events={created_events}
                        get_handle_ms={state => state.routing.args.created_at_ms}
                        change_handle_ms={ms => props.change_display_at_created_datetime({ ms })}
                        data_set_name="content_controls_created_at_datetimes"
                        title="Created at"
                    />}
                    <TimeSlider
                        events={sim_events}
                        get_handle_ms={state => state.routing.args.sim_ms}
                        change_handle_ms={ms => props.change_display_at_sim_datetime({ ms })}
                        data_set_name="content_controls_sim_datetimes"
                        title="Simulation"
                    />
                </Box>
            </Box>
        </Box>
    )
}

export const ContentControls = connector(_ContentControls) as FunctionalComponent<OwnProps>
