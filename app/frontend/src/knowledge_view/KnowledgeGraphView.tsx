import { FunctionalComponent, h } from "preact"

import type { ContentCoordinate } from "../canvas/interfaces"
import type { ChildrenRawData } from "../layout/interfaces"
import type { RootState } from "../state/State"
import { WComponentCanvasConnection } from "../knowledge/WComponentCanvasConnection"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { Canvas } from "../canvas/Canvas"
import { MainArea } from "../layout/MainArea"
import { connect, ConnectedProps } from "react-redux"
import { sort_list } from "../shared/utils/sort"
import type { WComponent } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../shared/wcomponent/utils_datetime"
import type { KnowledgeViewWComponentEntry } from "../shared/wcomponent/interfaces/knowledge_view"



const map_state = (state: RootState) =>
{
    const sync_ready = state.sync.ready

    const { current_UI_knowledge_view } = state.derived

    if (sync_ready && !current_UI_knowledge_view) console .log(`No current_UI_knowledge_view`)


    const { selected_wcomponent_ids_list, selected_wcomponent_ids_map } = state.meta_wcomponents


    let wcomponent_nodes: WComponent[] = []
    let a_location: KnowledgeViewWComponentEntry | undefined = undefined
    if (current_UI_knowledge_view)
    {
        wcomponent_nodes = current_UI_knowledge_view.wcomponent_nodes
        const selected_id = selected_wcomponent_ids_list[0]
        const a_node = wcomponent_nodes[0]
        const a_node_id = selected_id || a_node && a_node.id
        if (a_node_id)
        {
            a_location = current_UI_knowledge_view.derived_wc_id_map[a_node_id]
        }
    }


    return {
        sync_ready,
        a_location,
        wcomponent_nodes,
        wcomponent_connections: current_UI_knowledge_view && current_UI_knowledge_view.wcomponent_connections,
        presenting: state.display_options.consumption_formatting,
        display_by_simulated_time: state.display_options.display_by_simulated_time,
        selected_wcomponent_ids_map,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _KnowledgeGraphView (props: Props)
{
    const { elements, content_coordinates } = get_children(props)

    return <MainArea
        main_content={<Canvas
            svg_children={[]}
            svg_upper_children={get_svg_upper_children(props)}
            content_coordinates={content_coordinates}
            plain_background={props.presenting}
        >
            {elements}
        </Canvas>}
    />
}

export const KnowledgeGraphView = connector(_KnowledgeGraphView) as FunctionalComponent<{}>



const no_children: h.JSX.Element[] = []
const no_content_coordinates: ContentCoordinate[] = []
const get_children = (props: Props): ChildrenRawData =>
{
    const { sync_ready, display_by_simulated_time, a_location } = props
    let { wcomponent_nodes } = props
    if (!sync_ready || !wcomponent_nodes) return { elements: no_children, content_coordinates: no_content_coordinates }


    if (display_by_simulated_time)
    {
        const { selected_wcomponent_ids_map } = props
        const get_key = (wc: WComponent) =>
        {
            const entry = selected_wcomponent_ids_map[wc.id]

            if (entry !== undefined) return entry
            else return get_created_at_ms(wc)
        }

        wcomponent_nodes = sort_list(wcomponent_nodes, get_key, "ascending")
    }


    const elements = wcomponent_nodes.map(({ id }) => <WComponentCanvasNode
        key={id}
        id={id}
        on_graph={!display_by_simulated_time}
    />)


    const content_coordinates: ContentCoordinate[] = a_location ? [{ ...a_location, zoom: 100 }] : no_content_coordinates

    return {
        elements,
        content_coordinates,
    }
}



const no_svg_upper_children: h.JSX.Element[] = []
const get_svg_upper_children = ({ wcomponent_connections, display_by_simulated_time }: Props) =>
{
    if (!wcomponent_connections || display_by_simulated_time) return no_svg_upper_children

    return wcomponent_connections.map(({ id }) => <WComponentCanvasConnection key={id} id={id} />)
}
