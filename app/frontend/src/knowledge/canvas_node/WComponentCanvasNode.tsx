import Markdown from "markdown-to-jsx"
import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "./WComponentCanvasNode.css"
import { ConnectableCanvasNode } from "../../canvas/ConnectableCanvasNode"
import type { CanvasPoint } from "../../canvas/interfaces"
import type { KnowledgeView, KnowledgeViewWComponentEntry } from "../../shared/models/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../state/actions"
import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { wcomponent_is_invalid_for_datetime } from "../utils"
import { WComponentStatefulValue } from "../WComponentStatefulValue"
import { WComponentJudgements } from "../judgements/WComponentJudgements"
import { get_title } from "../../shared/models/get_rich_text"
import { round_canvas_point } from "../../canvas/position_utils"
import { Handles } from "./Handles"
import { get_created_at_ms } from "../../shared/models/utils_datetime"



interface OwnProps
{
    id: string
    knowledge_view: KnowledgeView
}



const map_state = (state: RootState, props: OwnProps) =>
{
    const intercept_wcomponent_click_to_edit_link = !!state.meta_wcomponents.intercept_wcomponent_click_to_edit_link
    const ctrl_key_is_down = state.global_keys.keys_down.has("Control")
    const { canvas_bounding_rect: cbr } = state.display

    return {
        wcomponent: get_wcomponent_from_state(state, props.id),
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        is_current_item: state.routing.item_id === props.id,
        is_selected: state.meta_wcomponents.selected_wcomponent_ids.has(props.id),
        is_highlighted: state.meta_wcomponents.highlighted_wcomponent_ids.has(props.id),
        intercept_wcomponent_click_to_edit_link,
        ctrl_key_is_down,
        canvas_bounding_rect_left: cbr ? cbr.left : 0,
        canvas_bounding_rect_top: cbr ? cbr.top : 0,
        display_at_created_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}



const map_dispatch = {
    clicked_wcomponent: ACTIONS.specialised_object.clicked_wcomponent,
    clear_selected_wcomponents: ACTIONS.specialised_object.clear_selected_wcomponents,
    change_route: ACTIONS.routing.change_route,
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
    upsert_knowledge_view_entry: ACTIONS.specialised_object.upsert_knowledge_view_entry,
    pointerupdown_on_connection_terminal: ACTIONS.specialised_object.pointerupdown_on_connection_terminal,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCanvasNode (props: Props)
{
    const [node_is_moving, set_node_is_moving] = useState<boolean>(false)

    const { id, knowledge_view, wcomponent, wcomponents_by_id,
        is_current_item, is_selected, is_highlighted,
        intercept_wcomponent_click_to_edit_link, ctrl_key_is_down,
        display_at_created_ms, sim_ms, } = props
    const { clicked_wcomponent, change_route, clear_selected_wcomponents, set_highlighted_wcomponent } = props

    if (!wcomponent) return <div>Could not find component of id {id}</div>


    // Do not show nodes if certain they are not valid / existing / likely
    const certain_is_not_valid = wcomponent_is_invalid_for_datetime(wcomponent, display_at_created_ms)
    if (certain_is_not_valid) return null


    const kv_entry = knowledge_view.wc_id_map[id]
    const hidden = display_at_created_ms < get_created_at_ms(wcomponent)


    const on_pointer_down = () =>
    {
        clicked_wcomponent({ id })

        if (!intercept_wcomponent_click_to_edit_link)
        {
            if (ctrl_key_is_down)
            {
                change_route({ route: "wcomponents", sub_route: "wcomponents_edit_multiple", item_id: null })
            }
            else
            {
                if (is_current_item)
                {
                    change_route({ route: "wcomponents", sub_route: null, item_id: null })
                    clear_selected_wcomponents({})
                }
                else change_route({ route: "wcomponents", sub_route: null, item_id: id })
            }
        }
    }


    const update_position = (new_position: CanvasPoint) =>
    {
        const new_entry: KnowledgeViewWComponentEntry = {
            ...kv_entry, ...new_position,
        }
        props.upsert_knowledge_view_entry({
            wcomponent_id: props.id,
            knowledge_view_id: props.knowledge_view.id,
            entry: new_entry,
        })

        set_node_is_moving(false)
        return
    }


    const parent_with_position_class_name = "connectable_canvas_node"
    const children: h.JSX.Element[] = []
    if (is_highlighted || node_is_moving)
    {
        children.push(<Handles
            set_node_is_moving={() => set_node_is_moving(true)}
        />)
    }


    const title = get_title({ wcomponent, rich_text: true, wcomponents_by_id, created_at_ms: display_at_created_ms, sim_ms })


    const extra_css_class = (
        ` ${parent_with_position_class_name} `
        + (node_is_moving ? " node_is_moving " : "")
        + (is_highlighted ? " node_is_highlighted " : "")
        + (is_current_item ? " node_is_current_item " : "")
        + (is_selected ? " node_is_selected " : "")
    )
    const glow = is_highlighted ? "orange" : ((is_selected || is_current_item) && "blue")


    return <ConnectableCanvasNode
        position={kv_entry}
        text={[
            <div className="node_state_value">
                <Markdown options={{ forceInline: true }}>{title}</Markdown>
            </div>,
            <div className="node_info_segments_container">
                <WComponentStatefulValue wcomponent={wcomponent} />
                <WComponentJudgements wcomponent={wcomponent} />
            </div>
        ]}
        hidden={hidden}
        extra_css_class={extra_css_class}
        unlimited_width={is_highlighted}
        glow={glow}
        on_pointer_down={on_pointer_down}
        on_pointer_enter={() => set_highlighted_wcomponent({ id, highlighted: true })}
        on_pointer_leave={() => set_highlighted_wcomponent({ id, highlighted: false })}
        pointerupdown_on_connection_terminal={(connection_location, up_down) => props.pointerupdown_on_connection_terminal({ connection_location, up_down, wcomponent_id: id })}
        extra_args={{
            draggable: node_is_moving,
            onDragStart: e =>
            {
                // Prevent green circle with white cross "copy / add" cursor icon
                // https://stackoverflow.com/a/56699962/539490
                e.dataTransfer!.dropEffect = "move"
            },
            onDragEnd: e => {
                e.currentTarget.style.cursor = "inherited"
                update_position(round_canvas_point({
                    left: kv_entry.left + e.offsetX - props.canvas_bounding_rect_left,
                    top: kv_entry.top + e.offsetY - props.canvas_bounding_rect_top,
                }))
            }
        }}
        children={children}
    />
}

export const WComponentCanvasNode = connector(_WComponentCanvasNode) as FunctionalComponent<OwnProps>
