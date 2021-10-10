import { h } from "preact"
import { WComponentCanvasNode } from "../knowledge/canvas/node/WComponentCanvasNode"

import type { WComponentPrioritisation } from "../wcomponent/interfaces/priorities"



interface Props
{
    prioritisation: WComponentPrioritisation
}


export function Prioritisation ({ prioritisation }: Props)
{
    return <WComponentCanvasNode id={prioritisation.id} on_graph={false} />
}
