import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import type { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"

import type { ProjectPriorityNodeProps } from "../../canvas/interfaces"
import { ACTIONS } from "../../state/actions"
import { CanvasNode } from "../../canvas/CanvasNode"



type OwnProps = ProjectPriorityNodeProps


const map_dispatch = (dispatch: Dispatch, own_props: OwnProps) => ({
    change_route: () => dispatch(ACTIONS.routing.change_route({ route: "objects", item_id: own_props.id }))
})

const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ProjectPriorityNode (props: Props)
{
    const [is_focused, set_is_focused] = useState(false)

    const { x, y, width, height, title, fields, effort, display } = props

    const w = effort > 0 ? Math.max(width, 150) : 150

    const percent = `${Math.round(effort * 100)}%`
    const backgroundImage = `linear-gradient(to top, #a6eaff ${percent}, rgba(0,0,0,0) ${percent})`
    const style_inner: h.JSX.CSSProperties = {
        backgroundImage,
    }

    return <CanvasNode
        position={{ left: x, top: y, width: w, height }}
        display={display}
        extra_css_class={is_focused ? "focused" : ""}
        on_pointer_enter={() => set_is_focused(true)}
        on_pointer_leave={() => set_is_focused(false)}
        on_click={() => props.change_route()}
    >
        <div className="node_main_content" style={style_inner}>
            <span title={title}>{title}</span>

            <hr />

            {fields.map(field => <div>
                {field.name}: {field.value}
            </div>)}
        </div>
    </CanvasNode>
}


export const ProjectPriorityNode = connector(_ProjectPriorityNode) as FunctionalComponent<OwnProps>
