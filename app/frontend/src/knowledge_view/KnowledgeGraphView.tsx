import { FunctionalComponent, h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { Canvas } from "../canvas/Canvas"
import type { ChildrenRawData } from "../layout/interfaces"
import { MainArea } from "../layout/MainArea"
import { pub_sub } from "../state/pub_sub/pub_sub"
import { get_wcomponents_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_store } from "../state/store"
import { WComponent, wcomponent_is_plain_connection } from "../wcomponent/interfaces/SpecialisedObjects"
import {
    WComponentCanvasConnection,
} from "../wcomponent_canvas/connection/WComponentCanvasConnection"
import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"
import { KnowledgeGraphTimeMarkers } from "./KnowledgeGraphTimeMarkers"
// import { WComponentCanvasNodeDebugCanvasPointerPosition } from "../debug/WComponentCanvasNodeDebugCanvasPointerPosition"



const map_state = (state: RootState) =>
{
    const { ready_for_reading: ready } = state.sync

    const { current_composed_knowledge_view } = state.derived

    if (ready && !current_composed_knowledge_view) console .log(`No current_composed_knowledge_view`)


    const { wc_ids_by_type, wcomponent_unfound_ids } = current_composed_knowledge_view || {}


    const any_node_is_moving = state.meta_wcomponents.wcomponent_ids_to_move_set.size > 0
    const any_frame_is_resizing = state.meta_wcomponents.frame_is_resizing
    // canvas_drag_event does not include the dragging of connections from one component
    // to another or dragging node background frame handles
    const canvas_drag_event = any_node_is_moving || any_frame_is_resizing

    return {
        ready,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        wc_ids_by_type,
        wcomponent_unfound_ids,
        presenting: state.display_options.consumption_formatting,
        show_large_grid: state.display_options.show_large_grid,
        canvas_drag_event,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _KnowledgeGraphView (props: Props)
{
    const elements = get_children(props)
    const [canvas_pointed_down, set_canvas_pointed_down] = useState(false)

    useEffect(() =>
    {
        return pub_sub.canvas.sub("canvas_pointer_down", () =>
        {
            set_canvas_pointed_down(true)
        })
    })

    useEffect(() =>
    {
        return pub_sub.canvas.sub("canvas_pointer_up", () =>
        {
            set_canvas_pointed_down(false)
        })
    })

    const extra_class_names = (props.canvas_drag_event || canvas_pointed_down) ? " canvas_drag_event " : ""

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

export const KnowledgeGraphView = connector(_KnowledgeGraphView) as FunctionalComponent



const no_children: h.JSX.Element[] = []
const get_children = (props: Props): ChildrenRawData =>
{
    const { ready, wc_ids_by_type, wcomponents_by_id, wcomponent_unfound_ids = [] } = props
    if (!ready) return no_children
    if (!wc_ids_by_type) return no_children
    const wcomponent_nodes: WComponent[] = []
    wc_ids_by_type.any_node.forEach(id => {
        const wc = wcomponents_by_id[id]
        if (wc) wcomponent_nodes.push(wc)
    })
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



const get_svg_upper_children = ({ wc_ids_by_type }: Props) =>
{
    const state = get_store().getState()
    const wcomponent_connections = get_wcomponents_from_state(state, wc_ids_by_type?.any_link)
        .filter(wcomponent_is_plain_connection)
    return wcomponent_connections.map(({ id }) => <WComponentCanvasConnection key={id} id={id} />)
}


const get_overlay_children = () =>
{
    return <KnowledgeGraphTimeMarkers />
}
