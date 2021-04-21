import { h } from "preact"

import { CanvasNode } from "../../canvas/CanvasNode"
import type { DailyActionNodeProps } from "../../canvas/interfaces"



interface OwnProps extends DailyActionNodeProps
{
    set_action_ids_to_show: (action_ids: string[]) => void
}


export function DailyActionNode (props: OwnProps)
{
    const { x, y, width, height, display, action_ids, set_action_ids_to_show } = props

    const extra_styles: h.JSX.CSSProperties = {
        backgroundColor: "orange",
        borderRadius: "2px",
        border: "thin solid #777",
    }

    return <CanvasNode
        position={{ width, height, left: x, top: y }}
        display={display}
        extra_styles={extra_styles}
        title={`${action_ids.length} actions`}
        on_click={() => set_action_ids_to_show(action_ids)}
    />
}
