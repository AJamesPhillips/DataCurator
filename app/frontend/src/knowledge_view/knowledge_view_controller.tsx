import { h } from "preact"

import type { CanvasPoint } from "../canvas/interfaces"
import type { ChildrenRawData } from "../layout/interfaces"
import { ViewController } from "../layout/ViewController"
import { KnowledgeView, wcomponent_can_render_connection } from "../shared/models/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { factory_get_wcomponent_time_slider_data } from "../time_control/prepare_data/wcomponent"
import { TimeSlider } from "../time_control/TimeSlider"
import { WComponentCanvasConnection } from "../knowledge/WComponentCanvasConnection"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { TimeSliderV2 } from "../time_control/TimeSliderV2"



const map_state = (state: RootState) =>
{
    const sync_ready = state.sync.ready

    const wcomponents = state.specialised_objects.wcomponents
    const knowledge_view_id = state.routing.args.subview_id
    const knowledge_view = state.specialised_objects.knowledge_views.find(({ id }) => id === knowledge_view_id)!

    if (sync_ready && knowledge_view_id && !knowledge_view) throw new Error(`Could not find knowledge_view: "${knowledge_view_id}"`)

    return {
        sync_ready,
        wcomponents,
        knowledge_view_id,
        knowledge_view: knowledge_view as KnowledgeView | undefined,
    }
}

type Props = ReturnType<typeof map_state>



const get_children = ({ sync_ready, wcomponents, knowledge_view_id, knowledge_view }: Props): ChildrenRawData =>
{
    if (!sync_ready || !knowledge_view_id || !knowledge_view) return { elements: [], content_coordinates: [] }

    const nodes = wcomponents.filter(({ type }) => type !== "causal_link")
        .filter(({ id }) => knowledge_view.wc_id_map[id])
    const elements = nodes.map(wc => <WComponentCanvasNode id={wc.id} knowledge_view={knowledge_view} />)

    const p = Object.values(knowledge_view.wc_id_map)[0]
    const content_coordinates: CanvasPoint[] = p ? [p] : []

    return {
        elements,
        content_coordinates,
    }
}



const get_svg_upper_children = ({ wcomponents, knowledge_view }: Props) =>
{
    if (!knowledge_view) return []

    const connections = wcomponents.filter(wcomponent_can_render_connection)

    return connections.map(({ id }) => <WComponentCanvasConnection id={id} knowledge_view={knowledge_view} />)
}



const get_content_controls = (props: Props, state: {}, set_state: (s: Partial<RootState>) => void) =>
{
    const { wcomponents, knowledge_view } = props

    if (!knowledge_view) return []

    const get_time_slider_data = factory_get_wcomponent_time_slider_data()
    wcomponents
        .filter(wc => !!knowledge_view.wc_id_map[wc.id])
        .forEach(wc => get_time_slider_data.update(wc))
    const { events } = get_time_slider_data.results()

    const elements = [
        <TimeSlider
            events={events}
            data_set_name="knowledge"
        />,
        <TimeSliderV2
            events={[
                { datetime: events[0].start_date, label: "", color: "black" },
                // { datetime: new Date(new Date().getTime() + 86400000 * 14), label: "", color: "blue" },
            ]}
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
