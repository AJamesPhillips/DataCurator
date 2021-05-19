import Markdown from "markdown-to-jsx"
import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "./WComponentCanvasNode.css"
import { ConnectableCanvasNode } from "../../canvas/ConnectableCanvasNode"
import type { CanvasPoint } from "../../canvas/interfaces"
import { KnowledgeViewWComponentEntry, wcomponent_is_process } from "../../shared/models/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../state/actions"
import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { wcomponent_existence_for_datetimes, wcomponent_is_invalid_for_datetime } from "../utils"
import { WComponentStatefulValue } from "../WComponentStatefulValue"
import { WComponentJudgements } from "../judgements/WComponentJudgements"
import { get_title } from "../../shared/models/rich_text/get_rich_text"
import { round_canvas_point } from "../../canvas/position_utils"
import { Handles } from "./Handles"
import { get_wc_id_counterfactuals_map } from "../../state/derived/accessor"



interface OwnProps
{
    id: string
}



const map_state = (state: RootState, own_props: OwnProps) =>
{
    const intercept_wcomponent_click_to_edit_link = !!state.meta_wcomponents.intercept_wcomponent_click_to_edit_link
    const ctrl_key_is_down = state.global_keys.keys_down.has("Control")
    const { canvas_bounding_rect: cbr } = state.display

    const { current_UI_knowledge_view } = state.derived
    const kv_entry = current_UI_knowledge_view && current_UI_knowledge_view.derived_wc_id_map[own_props.id]

    return {
        knowledge_view_id: current_UI_knowledge_view && current_UI_knowledge_view.id,
        wcomponent: get_wcomponent_from_state(state, own_props.id),
        wc_id_counterfactuals_map: get_wc_id_counterfactuals_map(state),
        kv_entry,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        is_current_item: state.routing.item_id === own_props.id,
        is_selected: state.meta_wcomponents.selected_wcomponent_ids.has(own_props.id),
        is_highlighted: state.meta_wcomponents.highlighted_wcomponent_ids.has(own_props.id),
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

    const { id, knowledge_view_id, kv_entry, wcomponent, wc_id_counterfactuals_map, wcomponents_by_id,
        is_current_item, is_selected, is_highlighted,
        intercept_wcomponent_click_to_edit_link, ctrl_key_is_down,
        display_at_created_ms, sim_ms, } = props
    const { clicked_wcomponent, change_route, clear_selected_wcomponents, set_highlighted_wcomponent } = props

    if (!knowledge_view_id) return <div>Not current knowledge view</div>
    if (!wcomponent) return <div>Could not find component of id {id}</div>
    if (!kv_entry) return <div>Could not find knowledge view entry for id {id}</div>


    // Do not show nodes if certain they are not valid / existing / likely
    const certain_is_not_valid = wcomponent_is_invalid_for_datetime(wcomponent, display_at_created_ms, sim_ms)
    if (certain_is_not_valid) return null

    const existence = wcomponent_existence_for_datetimes(wcomponent, display_at_created_ms, sim_ms)
    const existence_class_name = (!is_current_item && !is_highlighted && !is_selected)
        ? (existence.existence === 0 ? " node_does_not_exist " : ( existence.existence < 1 ? " node_may_not_exist " : ""))
        : ""


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
            knowledge_view_id,
            entry: new_entry,
        })

        set_node_is_moving(false)
        return
    }


    const children: h.JSX.Element[] = []
    if (is_highlighted || node_is_moving)
    {
        children.push(<Handles
            set_node_is_moving={() => set_node_is_moving(true)}
        />)
    }


    const title = get_title({ wcomponent, rich_text: true, wcomponents_by_id, wc_id_counterfactuals_map, created_at_ms: display_at_created_ms, sim_ms })


    const extra_css_class = (
        ` wcomponent_canvas_node `
        + (node_is_moving ? " node_is_moving " : "")
        + (is_highlighted ? " node_is_highlighted " : "")
        + (is_current_item ? " node_is_current_item " : "")
        + (is_selected ? " node_is_selected " : "")
        + (wcomponent_is_process(wcomponent) && wcomponent.is_action ? " node_is_action " : "")
        + existence_class_name
    )
    const glow = is_highlighted ? "orange" : ((is_selected || is_current_item) && "blue")


    return <ConnectableCanvasNode
        position={kv_entry}
        node_main_content={[
            <div className="node_upper_title">
                {wcomponent.type}
            </div>,
            <div className="node_title">
                <Markdown options={{ forceInline: true }}>{title}</Markdown>
            </div>,
            <div className="node_info_segments_container">
                <WComponentStatefulValue wcomponent={wcomponent} />
                <WComponentJudgements wcomponent={wcomponent} />
            </div>
        ]}
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
        other_children={children}
    />
}

export const WComponentCanvasNode = connector(_WComponentCanvasNode) as FunctionalComponent<OwnProps>
