import { FunctionalComponent } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { is_defined } from "../shared/utils/is_defined"
import { ContentControls } from "../sharedf/content_controls/ContentControls"
import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_wcomponent_time_slider_data } from "../time_control/prepare_data/wcomponent"



const map_state = (state: RootState) => ({
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    current_composed_knowledge_view: get_current_composed_knowledge_view_from_state(state),
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _KnowledgeContentControls (props: Props)
{
    const { wcomponents_by_id, current_composed_knowledge_view } = props

    if (!current_composed_knowledge_view) return <div/>
    const { composed_wc_id_map } = current_composed_knowledge_view


    const { created_events, sim_events } = useMemo(() =>
    {
        const wcomponents_on_kv = Object.keys(composed_wc_id_map)
            .map(id => wcomponents_by_id[id])
            .filter(is_defined)

        return get_wcomponent_time_slider_data(wcomponents_on_kv)
    }, [composed_wc_id_map, wcomponents_by_id])


    return <ContentControls
        created_events={created_events}
        sim_events={sim_events}
    />
}

export const KnowledgeContentControls = connector(_KnowledgeContentControls) as FunctionalComponent<{}>
