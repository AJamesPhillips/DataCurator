import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import Markdown from "markdown-to-jsx"

import "./LabelV2.css"
import { get_title } from "../wcomponent_derived/rich_text/get_rich_text"
import type { RootState } from "../state/State"
import { color_to_opposite, color_to_string } from "../sharedf/color"
import { MARKDOWN_OPTIONS } from "../sharedf/RichMarkDown"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"



interface OwnProps
{
    wcomponent_id: string
}



function map_state (state: RootState, { wcomponent_id }: OwnProps)
{
    const { wcomponents_by_id, knowledge_views_by_id } = state.specialised_objects
    const wcomponent = wcomponents_by_id[wcomponent_id]

    return {
        wcomponent,
        wcomponents_by_id,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map: get_wc_id_to_counterfactuals_v2_map(state),
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _LabelV2 (props: Props)
{
    const { wcomponent } = props


    const title = wcomponent ? get_title({
        wcomponent,
        rich_text: true,
        wcomponents_by_id: props.wcomponents_by_id,
        knowledge_views_by_id: props.knowledge_views_by_id,
        wc_id_to_counterfactuals_map: props.wc_id_to_counterfactuals_map,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    }) : "&lt;Label not found&gt;"


    return <div
        className="label_v2"
        style={{
            backgroundColor: color_to_string(wcomponent?.label_color),
            color: color_to_string(color_to_opposite(wcomponent?.label_color)),
        }}
        // onPointerOver={() => on_mouse_over_option && on_mouse_over_option(option.id)}
        // onPointerLeave={() => on_mouse_leave_option && on_mouse_leave_option(option.id)}
        // onPointerDown={e => pointer_down && pointer_down(e, option.id)}
    >
        <Markdown options={MARKDOWN_OPTIONS}>
            {title}
        </Markdown>
    </div>
}

export const LabelV2 = connector(_LabelV2) as FunctionalComponent<OwnProps>
