import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { useState } from "preact/hooks"
import Markdown from "markdown-to-jsx"

import "./PrioritisationEntryNode.scss"
import { ACTIONS } from "../state/actions"
import { CanvasNode } from "../canvas/CanvasNode"
import type { RootState } from "../state/State"
import { get_title } from "../wcomponent_derived/rich_text/get_rich_text"
import { MARKDOWN_OPTIONS } from "../sharedf/RichMarkDown"



interface PrioritisationEntryNodeProps
{
    wcomponent_id: string
    effort: number
    x: number
    y: number
    width: number
    height: number

    display: boolean
}

type OwnProps = PrioritisationEntryNodeProps



const map_state = (state: RootState) =>
({
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    created_at_ms: state.routing.args.created_at_ms,
})

const map_dispatch = {
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _PrioritisationEntryNode (props: Props)
{
    const { wcomponents_by_id, knowledge_views_by_id, created_at_ms, x, y, width, height, effort, display } = props
    const wcomponent = wcomponents_by_id[props.wcomponent_id]
    if (!wcomponent) return null

    const title = get_title({
        rich_text: true,
        wcomponent,
        wcomponents_by_id,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map: undefined,
        created_at_ms,
        sim_ms: new Date().getTime(),
    })

    const initial_w = Math.max(width, 60)
    const hover_w = Math.max(width, 250)
    const [w, set_w] = useState(initial_w)

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
        on_pointer_enter={() => set_w(hover_w)}
        on_pointer_leave={() => set_w(initial_w)}
        extra_css_class=" prioritisation_entry "
    >
        <div className="node_main_content" style={style_inner}>
            &nbsp;<span title={title}>
                <Markdown options={MARKDOWN_OPTIONS}>
                    {title}
                </Markdown>
            </span>

            <div>
                <br />
                <span style={{ color: "grey", fontSize: 10 }}>
                    &nbsp; {effort > 0 && `Effort ${percent}`}
                </span>
            </div>
        </div>
    </CanvasNode>
}


export const PrioritisationEntryNode = connector(_PrioritisationEntryNode) as FunctionalComponent<OwnProps>
