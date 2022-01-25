import { h } from "preact"
import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"

import type { WComponentPrioritisation } from "../wcomponent/interfaces/priorities"



interface Props
{
    prioritisation: WComponentPrioritisation
}


export function Prioritisation ({ prioritisation }: Props)
{
    return <WComponentCanvasNode id={prioritisation.id} is_on_canvas={false} always_show={true} />
}
