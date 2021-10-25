import { h } from "preact"
import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"

import type { WComponentPrioritisation } from "../wcomponent/interfaces/priorities"



interface Props
{
    prioritisation: WComponentPrioritisation
}


export function Prioritisation ({ prioritisation }: Props)
{
    return <WComponentCanvasNode id={prioritisation.id} is_movable={false} always_show={true} />
}
