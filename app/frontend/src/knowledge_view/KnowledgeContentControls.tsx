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

    return <div>
        {(props.editing || props.display_created_at_time_slider) && <TimeSlider
            events={created_events}
            get_handle_ms={state => state.routing.args.created_at_ms}
            change_handle_ms={ms => props.change_display_at_created_datetime({ ms })}
            data_set_name="knowledge_created_at_datetimes"
            title="Created at"
        />}

        {(props.editing || props.display_created_at_time_slider) && <Button
            is_left={true}
            value={props.linked_datetime_sliders ? "Unlink" : "Link"}
            onClick={() => props.toggle_linked_datetime_sliders()}
            extra_class_names="content_control_button"
        />}

        <div style={{ width: 40, display: "inline-block" }}></div>

        Time resolution:
        <TimeResolutionOptions extra_styles={{ display: "inline-block", width: 100 }} />

        Display by <span
            style={{ cursor: "pointer" }}
            onPointerDown={() =>
            {
                const display_by_simulated_time = !props.display_by_simulated_time
                props.set_display_by_simulated_time({ display_by_simulated_time })
            }}
        >
            {props.display_by_simulated_time ? "simulated time" : "relationsips"}
        </span>

        <TimeSlider
            events={sim_events}
            get_handle_ms={state => state.routing.args.sim_ms}
            change_handle_ms={ms => props.change_display_at_sim_datetime({ ms })}
            data_set_name="knowledge_sim_datetimes"
            title="Simulation"
        />
    </div>
}

export const KnowledgeContentControls = connector(_KnowledgeContentControls) as FunctionalComponent<{}>
