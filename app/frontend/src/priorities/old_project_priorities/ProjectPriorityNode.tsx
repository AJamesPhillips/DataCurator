import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import Markdown from "markdown-to-jsx"

import { ACTIONS } from "../../state/actions"
import { CanvasNode } from "../../canvas/CanvasNode"
import type { RootState } from "../../state/State"
import { get_title } from "../../wcomponent_derived/rich_text/get_rich_text"
import { MARKDOWN_OPTIONS } from "../../sharedf/RichMarkDown"



interface ProjectPriorityNodeProps
{
    wcomponent_id: string
    effort: number
    x: number
    y: number
    width: number
    height: number

    display: boolean
}

type OwnProps = ProjectPriorityNodeProps



const map_state = (state: RootState) =>
({
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    created_at_ms: state.routing.args.created_at_ms,
})

const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ProjectPriorityNode (props: Props)
{
    const { wcomponents_by_id, created_at_ms, x, y, width, height, effort, display } = props
    const wcomponent = wcomponents_by_id[props.wcomponent_id]
    if (!wcomponent) return null

    const title = get_title({
        rich_text: true,
        wcomponent,
        wcomponents_by_id,
        wc_id_to_counterfactuals_map: {},
        created_at_ms,
        sim_ms: new Date().getTime(),
    })

    const w = effort > 0 ? Math.max(width, 150) : 150

    const percent = `${Math.round(effort * 100)}%`
    const backgroundImage = `linear-gradient(to top, #a6eaff ${percent}, rgba(0,0,0,0) ${percent})`
    const style_inner: h.JSX.CSSProperties = {
        backgroundImage,
        backgroundColor: "white",
    }

    return <CanvasNode
        position={{ left: x, top: y, width: w, height }}
        display={display}
        on_pointer_down={e =>
        {
            e.stopImmediatePropagation()
            e.preventDefault()
            props.change_route({ item_id: props.wcomponent_id })
        }}
    >
        <div className="node_main_content" style={style_inner}>
            &nbsp;<span title={title}>
                <Markdown options={MARKDOWN_OPTIONS}>
                    {title}
                </Markdown>
            </span>

            {effort > 0 && <div>
                <hr />
                Effort {percent}
            </div>}
        </div>
    </CanvasNode>
}


export const ProjectPriorityNode = connector(_ProjectPriorityNode) as FunctionalComponent<OwnProps>
