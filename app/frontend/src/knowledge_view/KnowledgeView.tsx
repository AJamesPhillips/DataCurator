import { FunctionalComponent, h } from "preact"

import type { ContentCoordinate } from "../canvas/interfaces"
import type { ChildrenRawData } from "../layout/interfaces"
import { wcomponent_can_render_connection } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { WComponentCanvasConnection } from "../knowledge/WComponentCanvasConnection"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { Canvas } from "../canvas/Canvas"
import { MainArea } from "../layout/MainArea"
import { connect, ConnectedProps } from "react-redux"



const map_state = (state: RootState) =>
{
    const sync_ready = state.sync.ready

    const wcomponents = state.derived.wcomponents
    const { current_UI_knowledge_view } = state.derived

    if (sync_ready && !current_UI_knowledge_view) console .log(`No current_UI_knowledge_view`)

    return {
        sync_ready,
        wcomponents,
        current_UI_knowledge_view,
        presenting: state.display_options.consumption_formatting,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


const get_children = ({ sync_ready, wcomponents, current_UI_knowledge_view }: Props): ChildrenRawData =>
{
    if (!sync_ready || !current_UI_knowledge_view) return { elements: [], content_coordinates: [] }

    const nodes = wcomponents
        .filter(({ type }) => type !== "causal_link" && type !== "relation_link" && type !== "counterfactual")
        .filter(({ id }) => current_UI_knowledge_view.derived_wc_id_map[id])
    const elements = nodes.map(wc => <WComponentCanvasNode id={wc.id} />)

    const p = Object.values(current_UI_knowledge_view.derived_wc_id_map)[0]
    const content_coordinates: ContentCoordinate[] = p ? [{...p, zoom: 100}] : []

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



function _KnowledgeView (props: Props)
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

export const KnowledgeView = connector(_KnowledgeView) as FunctionalComponent<{}>
