import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { ChildrenRawData } from "../layout/interfaces"
import type { RootState } from "../state/State"
import {
    WComponentCanvasConnection,
} from "../wcomponent_canvas/connection/WComponentCanvasConnection"
import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"
import { Canvas } from "../canvas/Canvas"
import { MainArea } from "../layout/MainArea"
import { KnowledgeGraphTimeMarkers } from "./KnowledgeGraphTimeMarkers"
// import { WComponentCanvasNodeDebugCanvasPointerPosition } from "../debug/WComponentCanvasNodeDebugCanvasPointerPosition"



const map_state = (state: RootState) =>
{
    const { ready_for_reading: ready } = state.sync

    const { current_composed_knowledge_view } = state.derived

    if (ready && !current_composed_knowledge_view) console .log(`No current_composed_knowledge_view`)


    const { wcomponent_nodes, wcomponent_connections, wcomponent_unfound_ids } = current_composed_knowledge_view || {}

    const any_node_is_moving = state.meta_wcomponents.wcomponent_ids_to_move_set.size > 0
    const any_frame_is_resizing = state.meta_wcomponents.frame_is_resizing
    // todo rename as any_drag_event does not include the dragging of connections from one component to another
    const any_drag_event = any_node_is_moving || any_frame_is_resizing

    return {
        ready,
        wcomponent_nodes,
        wcomponent_connections,
        wcomponent_unfound_ids,
        presenting: state.display_options.consumption_formatting,
        show_large_grid: state.display_options.show_large_grid,
        any_drag_event,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _KnowledgeGraphView (props: Props)
{
    const elements = get_children(props)

    const extra_class_names = props.any_drag_event ? " any_drag_event " : ""

    return <MainArea
        main_content={<Canvas
            svg_children={[]}
            svg_upper_children={get_svg_upper_children(props)}
            overlay={get_overlay_children()}
            plain_background={props.presenting}
            show_large_grid={props.show_large_grid}
            extra_class_names={extra_class_names}
        >
            {elements}
        </Canvas>}
    />
}

export const KnowledgeGraphView = connector(_KnowledgeGraphView) as FunctionalComponent<{}>



const no_children: h.JSX.Element[] = []
const get_children = (props: Props): ChildrenRawData =>
{
    const { ready, wcomponent_nodes = [], wcomponent_unfound_ids = [] } = props
    if (!ready) return no_children
    if (wcomponent_nodes.length === 0 && wcomponent_unfound_ids.length === 0) return no_children


    const elements = [
        ...wcomponent_nodes.map(({ id }) => <WComponentCanvasNode
            key={id}
            id={id}
        />),

        ...wcomponent_unfound_ids.map(id => <WComponentCanvasNode
            key={id}
            id={id}
        />),

        // <WComponentCanvasNodeDebugCanvasPointerPosition
        //     key={"debug_canvas_pointer_position"}
        // />
    ]

    return elements
}



const get_svg_upper_children = ({ wcomponent_connections = [] }: Props) =>
{
    return wcomponent_connections.map(({ id }) => <WComponentCanvasConnection key={id} id={id} />)
}


const get_overlay_children = () =>
{
    return <KnowledgeGraphTimeMarkers />
}
