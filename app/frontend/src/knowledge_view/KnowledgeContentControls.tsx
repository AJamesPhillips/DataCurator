import { FunctionalComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_wcomponent_time_slider_data } from "../time_control/prepare_data/wcomponent"
import { ContentControls } from "../sharedf/content_controls/ContentControls"



const map_state = (state: RootState) => ({
    wcomponents: state.derived.wcomponents,
    current_composed_knowledge_view: get_current_composed_knowledge_view_from_state(state),
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _KnowledgeContentControls (props: Props)
{
    const { wcomponents, current_composed_knowledge_view } = props

    if (!current_composed_knowledge_view) return <div/>
    const { composed_wc_id_map } = current_composed_knowledge_view

    const wcomponents_on_kv = useMemo(() =>
        wcomponents.filter(wc => !!composed_wc_id_map[wc.id])
    , [wcomponents, composed_wc_id_map])


    const { created_events, sim_events } = useMemo(() =>
        get_wcomponent_time_slider_data(wcomponents_on_kv)
    , [wcomponents_on_kv])

    return <ContentControls
        created_events={created_events}
        sim_events={sim_events}
    />
}

export const KnowledgeContentControls = connector(_KnowledgeContentControls) as FunctionalComponent<{}>
