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
import { TemporaryDraggedCanvasNode } from "../canvas/TemporaryDraggedCanvasNode"



const map_state = (state: RootState) =>
{
    const { ready_for_reading: ready } = state.sync

    const { current_composed_knowledge_view } = state.derived

    if (ready && !current_composed_knowledge_view) console .log(`No current_composed_knowledge_view`)


    const { wcomponent_nodes, wcomponent_connections } = current_composed_knowledge_view || {}
    const { selected_wcomponent_ids_map } = state.meta_wcomponents


    return {
        ready,
        wcomponent_nodes,
        wcomponent_connections,
        presenting: state.display_options.consumption_formatting,
        selected_wcomponent_ids_map,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _KnowledgeGraphView (props: Props)
{
    const elements = get_children(props)

    return <MainArea
        main_content={<Canvas
            svg_children={[]}
            svg_upper_children={get_svg_upper_children(props)}
            overlay={get_overlay_children()}
            plain_background={props.presenting}
        >
            {elements}
        </Canvas>}
    />
}

export const KnowledgeGraphView = connector(_KnowledgeGraphView) as FunctionalComponent<{}>



const no_children: h.JSX.Element[] = []
const get_children = (props: Props): ChildrenRawData =>
{
    const { ready } = props
    let { wcomponent_nodes } = props
    if (!ready || !wcomponent_nodes || wcomponent_nodes.length === 0) return no_children


    const elements = wcomponent_nodes.map(({ id }) => <WComponentCanvasNode
        key={id}
        id={id}
    />)
    elements.push(<TemporaryDraggedCanvasNode />)

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
