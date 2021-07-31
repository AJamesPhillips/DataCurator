import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_wcomponent_time_slider_data } from "../time_control/prepare_data/wcomponent"
import { ContentControls } from "../sharedf/content_controls/ContentControls"
import { useMemo } from "preact/hooks"



const map_state = (state: RootState) => ({
    selected_component_id: state.routing.item_id,
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
    const { wcomponents, current_composed_knowledge_view, selected_component_id } = props

    if (!current_composed_knowledge_view) return <div></div>

    const wcomponents_on_kv = useMemo(() =>
        wcomponents
        .filter(wc => !!current_composed_knowledge_view.composed_wc_id_map[wc.id])
        .filter(wc => wc.type !== "counterfactual")
    , [wcomponents, current_composed_knowledge_view])

    const move_to_component_id = selected_component_id || wcomponents_on_kv[0]?.id

    const { created_events, sim_events } = useMemo(() =>
        get_wcomponent_time_slider_data(wcomponents_on_kv)
    , [wcomponents_on_kv])

    return <ContentControls
        move_to_component_id={move_to_component_id}
        created_events={created_events}
        sim_events={sim_events}
    />
}

export const KnowledgeContentControls = connector(_KnowledgeContentControls) as FunctionalComponent<{}>
