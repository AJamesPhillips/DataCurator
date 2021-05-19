import { h } from "preact"

import { CanvasNode } from "../../canvas/CanvasNode"
import type { DailyActionNodeProps } from "../../canvas/interfaces"
import { DailyActionsList } from "./DailyActionsList"



export function DailyActionNode (props: DailyActionNodeProps)
{
    const [action_ids_to_show, set_action_ids_to_show] = [[], (action_ids: string[]) => {}]

    const { x, y, width, height, display, action_ids } = props

    const extra_styles: h.JSX.CSSProperties = {
        backgroundColor: "orange",
        borderRadius: "2px",
        border: "thin solid #777",
    }

    const canvas_node = <CanvasNode
        position={{ width, height, left: x, top: y }}
        display={display}
        extra_styles={extra_styles}
        title={`${action_ids.length} actions`}
        on_click={() => set_action_ids_to_show(action_ids)}
    />

    if (action_ids_to_show.length === 0) return canvas_node
    else return <div>
        {canvas_node}
        <DailyActionsList
            action_ids_to_show={action_ids_to_show}
            on_close={() => set_action_ids_to_show([])}
        />
    </div>
}
