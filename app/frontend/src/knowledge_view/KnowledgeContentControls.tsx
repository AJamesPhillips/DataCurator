import { FunctionalComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_wcomponent_time_slider_data } from "../time_control/prepare_data/wcomponent"
import { ContentControls } from "../sharedf/content_controls/ContentControls"



const map_state = (state: RootState) => ({
    selected_component_id: state.routing.item_id,
    wcomponents: state.derived.wcomponents,
    current_composed_knowledge_view: get_current_composed_knowledge_view_from_state(state),
    linked_datetime_sliders: state.controls.linked_datetime_sliders,
    display_by_simulated_time: state.display_options.display_by_simulated_time,
    display_time_sliders: state.controls.display_time_sliders,
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
    const { composed_wc_id_map } = current_composed_knowledge_view

    const wcomponents_on_kv = useMemo(() =>
        wcomponents.filter(wc => !!composed_wc_id_map[wc.id])
    , [wcomponents, composed_wc_id_map])


    let move_to_component_id = selected_component_id || wcomponents_on_kv[0]?.id
    if (move_to_component_id && !composed_wc_id_map[move_to_component_id])
    {
        move_to_component_id = undefined
    }


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
