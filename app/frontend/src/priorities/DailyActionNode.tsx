import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { CanvasNode } from "../canvas/CanvasNode"
import type { NodeProps } from "../canvas/interfaces"
import { ACTIONS } from "../state/actions"



export interface DailyActionNodeProps extends NodeProps
{
    action_ids: string[]
    date_shown: Date
}


const map_dispatch = {
    set_action_ids_to_show: ACTIONS.view_priorities.set_action_ids_to_show,
}

const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector> & DailyActionNodeProps



function _DailyActionNode (props: Props)
{
    const { x, y, width, height, display, action_ids, date_shown } = props

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
        on_click={() => props.set_action_ids_to_show({ action_ids, date_shown }) }
    />

    return canvas_node
}

export const DailyActionNode = connector(_DailyActionNode) as FunctionalComponent<DailyActionNodeProps>
