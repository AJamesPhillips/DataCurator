import { h } from "preact"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"

import type { WComponentPrioritisation } from "../shared/wcomponent/interfaces/priorities"



interface Props
{
    prioritisation: WComponentPrioritisation
}


export function Prioritisation ({ prioritisation }: Props)
{
    return <WComponentCanvasNode id={prioritisation.id} on_graph={false} />
}
