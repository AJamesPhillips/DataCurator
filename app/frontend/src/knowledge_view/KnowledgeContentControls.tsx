import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./KnowledgeContentControls.css"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_wcomponent_time_slider_data } from "../time_control/prepare_data/wcomponent"
import { TimeSlider } from "../time_control/TimeSlider"
import { AutocompleteText } from "../form/AutocompleteText"
import { time_resolution_types } from "../state/display/state"



const map_state = (state: RootState) => ({
    wcomponents: state.derived.wcomponents,
    current_UI_knowledge_view: get_current_UI_knowledge_view_from_state(state),
    linked_datetime_sliders: state.controls.linked_datetime_sliders,
    time_resolution: state.display.time_resolution,
})


const map_dispatch = {
    change_display_at_created_datetime: ACTIONS.display_at_created_datetime.change_display_at_created_datetime,
    change_display_at_sim_datetime: ACTIONS.display_at_sim_datetime.change_display_at_sim_datetime,
    toggle_linked_datetime_sliders: ACTIONS.controls.toggle_linked_datetime_sliders,
    set_time_resolution: ACTIONS.display.set_time_resolution,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _KnowledgeContentControls (props: Props)
{
    const { wcomponents, current_UI_knowledge_view } = props

    if (!current_UI_knowledge_view) return <div></div>

    const wcomponents_on_kv = wcomponents
        .filter(wc => !!current_UI_knowledge_view.derived_wc_id_map[wc.id])
        .filter(wc => wc.type !== "counterfactual")
    const { created_events, sim_events } = get_wcomponent_time_slider_data(wcomponents_on_kv)

    return <div>
        <TimeSlider
            events={created_events}
            get_handle_ms={state => state.routing.args.created_at_ms}
            change_handle_ms={ms => props.change_display_at_created_datetime({ ms })}
            data_set_name="knowledge_created_at_datetimes"
        />
        <Button
            is_left={true}
            value={props.linked_datetime_sliders ? "Unlink" : "Link"}
            on_pointer_down={() => props.toggle_linked_datetime_sliders()}
            extra_class_names="button_link_time_sliders"
        />
        <div style={{ width: 40, display: "inline-block" }}></div>
        Time resolution:
        <AutocompleteText
            placeholder="Time resolution..."
            selected_option_id={props.time_resolution}
            options={time_resolution_types.map(type => ({ id: type, title: type }))}
            allow_none={false}
            on_change={time_resolution => time_resolution && props.set_time_resolution({ time_resolution })}
            extra_styles={{ display: "inline-block", width: 100 }}
        />
        <TimeSlider
            events={sim_events}
            get_handle_ms={state => state.routing.args.sim_ms}
            change_handle_ms={ms => props.change_display_at_sim_datetime({ ms })}
            data_set_name="knowledge_sim_datetimes"
        />
    </div>
}

export const KnowledgeContentControls = connector(_KnowledgeContentControls) as FunctionalComponent<{}>
