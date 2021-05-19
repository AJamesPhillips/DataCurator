import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { WComponent } from "../shared/models/interfaces/SpecialisedObjects"
import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_wcomponent_time_slider_data } from "../time_control/prepare_data/wcomponent"
import { TimeSlider } from "../time_control/TimeSlider"
import { TimeSliderV2 } from "../time_control/TimeSliderV2"



const map_state = (state: RootState) => ({
    wcomponents: state.derived.wcomponents,
    current_UI_knowledge_view: get_current_UI_knowledge_view_from_state(state),
})

const connector = connect(map_state)
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
            data_set_name="knowledge_created_at_datetimes"
        />
        <TimeSliderV2
            events={sim_events}
            data_set_name="knowledge_sim_datetimes"
        />
    </div>
}

export const KnowledgeContentControls = connector(_KnowledgeContentControls) as FunctionalComponent<{}>
