import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./KnowledgeContentControls.css"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_wcomponent_time_slider_data } from "../time_control/prepare_data/wcomponent"
import { TimeSlider } from "../time_control/TimeSlider"
import { TimeResolutionOptions } from "../display_options/TimeResolutionOptions"
import ToggleButton from "@material-ui/lab/ToggleButton"
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup"
import { Box } from "@material-ui/core"
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import LinkIcon from '@material-ui/icons/Link';

const map_state = (state: RootState) => ({
    wcomponents: state.derived.wcomponents,
    current_composed_knowledge_view: get_current_composed_knowledge_view_from_state(state),
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
type Props = ConnectedProps<typeof connector>


function _KnowledgeContentControls (props: Props)
{
    const { wcomponents, current_composed_knowledge_view } = props

    if (!current_composed_knowledge_view) return <div></div>

    const wcomponents_on_kv = wcomponents
        .filter(wc => !!current_composed_knowledge_view.composed_wc_id_map[wc.id])
        .filter(wc => wc.type !== "counterfactual")
    const { created_events, sim_events } = get_wcomponent_time_slider_data(wcomponents_on_kv)

    return (
        <Box p={2} mb={2} borderTop={1} borderColor="primary.main">
            {/* <div style={{ width: 40, display: "inline-block" }}></div> */}


            <Box mb={2}  display="flex" flexDirection="row" justifyContent="space-between">
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
                        aria-label="text formatting">
                            <ToggleButton value={true} aria-label="Display by simulated time">
                               Simulated Time
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
                        data_set_name="knowledge_created_at_datetimes"
                        title="Created at"
                    />}
                    <TimeSlider
                        events={sim_events}
                        get_handle_ms={state => state.routing.args.sim_ms}
                        change_handle_ms={ms => props.change_display_at_sim_datetime({ ms })}
                        data_set_name="knowledge_sim_datetimes"
                        title="Simulation"
                    />
                </Box>
            </Box>
        </Box>
    )
}

export const KnowledgeContentControls = connector(_KnowledgeContentControls) as FunctionalComponent<{}>
