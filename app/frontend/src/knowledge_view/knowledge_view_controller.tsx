import { h } from "preact"

import type { CanvasPoint } from "../canvas/interfaces"
import type { ChildrenRawData } from "../layout/interfaces"
import { ViewController } from "../layout/ViewController"
import { wcomponent_can_render_connection } from "../shared/models/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { get_wcomponent_time_slider_data } from "../time_control/prepare_data/wcomponent"
import { TimeSlider } from "../time_control/TimeSlider"
import { WComponentCanvasConnection } from "../knowledge/WComponentCanvasConnection"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { TimeSliderV2 } from "../time_control/TimeSliderV2"



const map_state = (state: RootState) =>
{
    const sync_ready = state.sync.ready

    const wcomponents = state.derived.wcomponents
    const { current_UI_knowledge_view } = state.derived

    if (sync_ready && !current_UI_knowledge_view) console.log(`No current_UI_knowledge_view`)

    return {
        sync_ready,
        wcomponents,
        current_UI_knowledge_view,
    }
}

type Props = ReturnType<typeof map_state>



const get_children = ({ sync_ready, wcomponents, current_UI_knowledge_view }: Props): ChildrenRawData =>
{
    if (!sync_ready || !current_UI_knowledge_view) return { elements: [], content_coordinates: [] }

    const nodes = wcomponents
        .filter(({ type }) => type !== "causal_link")
        .filter(({ id }) => current_UI_knowledge_view.derived_wc_id_map[id])
    const elements = nodes.map(wc => <WComponentCanvasNode id={wc.id} />)

    const p = Object.values(current_UI_knowledge_view.derived_wc_id_map)[0]
    const content_coordinates: CanvasPoint[] = p ? [p] : []

    return {
        elements,
        content_coordinates,
    }
}



const get_svg_upper_children = ({ wcomponents, current_UI_knowledge_view }: Props) =>
{
    if (!current_UI_knowledge_view) return []

    const connections = wcomponents.filter(wcomponent_can_render_connection)

    return connections.map(({ id }) => <WComponentCanvasConnection id={id} />)
}



const get_content_controls = (props: Props, state: {}, set_state: (s: Partial<RootState>) => void) =>
{
    const { wcomponents, current_UI_knowledge_view } = props

    if (!current_UI_knowledge_view) return []

    const wcomponents_on_kv = wcomponents.filter(wc => !!current_UI_knowledge_view.derived_wc_id_map[wc.id])
    const { created_events, sim_events } = get_wcomponent_time_slider_data(wcomponents_on_kv)

    const elements = [
        <TimeSlider
            events={created_events}
            data_set_name="knowledge_created_at_datetimes"
        />,
        <TimeSliderV2
            events={sim_events}
            data_set_name="knowledge_sim_datetimes"
        />,
    ]

    return elements
}



export function KnowledgeViewController (view_needs_to_update: () => void)
{
    return new ViewController({
        view_needs_to_update,
        map_state,
        get_initial_state: () => ({}),
        get_children,
        get_svg_upper_children,
        get_content_controls,
    })
}
