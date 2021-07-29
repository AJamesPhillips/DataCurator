import { FunctionalComponent, h } from "preact"

import type { ChildrenRawData } from "../layout/interfaces"
import type { RootState } from "../state/State"
import { WComponentCanvasConnection } from "../knowledge/WComponentCanvasConnection"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { Canvas } from "../canvas/Canvas"
import { MainArea } from "../layout/MainArea"
import { connect, ConnectedProps } from "react-redux"
import type { WComponent } from "../shared/wcomponent/interfaces/SpecialisedObjects"



const map_state = (state: RootState) =>
{
    const sync_ready = state.sync.ready

    const { current_composed_knowledge_view: current_composed_knowledge_view } = state.derived

    if (sync_ready && !current_composed_knowledge_view) console .log(`No current_composed_knowledge_view`)


    const { selected_wcomponent_ids_map } = state.meta_wcomponents


    let wcomponent_nodes: WComponent[] = []
    if (current_composed_knowledge_view)
    {
        wcomponent_nodes = current_composed_knowledge_view.wcomponent_nodes
    }


    return {
        sync_ready,
        wcomponent_nodes,
        wcomponent_connections: current_composed_knowledge_view && current_composed_knowledge_view.wcomponent_connections,
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
    const { sync_ready } = props
    let { wcomponent_nodes } = props
    if (!sync_ready || !wcomponent_nodes) return no_children


    const elements = wcomponent_nodes.map(({ id }) => <WComponentCanvasNode
        key={id}
        id={id}
    />)

    return elements
}



const no_svg_upper_children: h.JSX.Element[] = []
const get_svg_upper_children = ({ wcomponent_connections }: Props) =>
{
    if (!wcomponent_connections) return no_svg_upper_children

    return wcomponent_connections.map(({ id }) => <WComponentCanvasConnection key={id} id={id} />)
}
