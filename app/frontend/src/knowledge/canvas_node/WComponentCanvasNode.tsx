import Markdown from "markdown-to-jsx"
import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "./WComponentCanvasNode.css"
import { ConnectableCanvasNode } from "../../canvas/ConnectableCanvasNode"
import type { CanvasPoint } from "../../canvas/interfaces"
import {
    connection_terminal_attributes,
    connection_terminal_directions,
    wcomponent_has_legitimate_non_empty_state,
    wcomponent_is_action,
    wcomponent_should_have_state,
} from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { KnowledgeViewWComponentEntry } from "../../shared/wcomponent/interfaces/knowledge_view"
import { ACTIONS } from "../../state/actions"
import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { get_wcomponent_is_invalid_for_display, wcomponent_is_not_yet_created } from "../utils"
import { WComponentStatefulValue } from "../WComponentStatefulValue"
import { WComponentJudgements } from "../judgements/WComponentJudgements"
import { get_title } from "../../shared/wcomponent/rich_text/get_rich_text"
import { round_canvas_point } from "../../canvas/position_utils"
import { Handles } from "./Handles"
import { get_wcomponent_counterfactuals, get_wc_id_counterfactuals_map } from "../../state/derived/accessor"
import { WComponentValidityValue } from "../WComponentValidityValue"
import { get_top_left_for_terminal_type, Terminal } from "../../canvas/connections/terminal"
import { get_wcomponent_validity_value } from "../../shared/wcomponent/get_wcomponent_validity_value"
import { bounded, rescale } from "../../shared/utils/bounded"



interface OwnProps
{
    id: string
}



const map_state = (state: RootState, own_props: OwnProps) =>
{
    const ctrl_key_is_down = state.global_keys.keys_down.has("Control")
    const { canvas_bounding_rect: cbr } = state.display_options

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
        ctrl_key_is_down,
        canvas_bounding_rect_left: cbr ? cbr.left : 0,
        canvas_bounding_rect_top: cbr ? cbr.top : 0,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        wc_counterfactuals: get_wcomponent_counterfactuals(state, own_props.id),
        editing: !state.display_options.consumption_formatting,
        node_allowed_to_move: state.meta_wcomponents.last_pointer_down_connection_terminal === undefined,
        validity_to_certainty: state.display_options.validity_to_certainty,
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
        ctrl_key_is_down,
        node_allowed_to_move,
        created_at_ms, sim_ms, wc_counterfactuals, validity_to_certainty, } = props
    const { clicked_wcomponent, change_route, clear_selected_wcomponents, set_highlighted_wcomponent } = props

    if (!knowledge_view_id) return <div>No current knowledge view</div>
    if (!wcomponent) return <div>Could not find component of id {id}</div>
    if (!kv_entry) return <div>Could not find knowledge view entry for id {id}</div>


    // Do not show nodes if they do no exist yet
    const is_not_created = wcomponent_is_not_yet_created(wcomponent, created_at_ms)
    if (is_not_created) return null


    // Do not show nodes if they are invalid
    const validity_value = get_wcomponent_validity_value({ wcomponent, created_at_ms, sim_ms })
    const is_invalid_for_display = get_wcomponent_is_invalid_for_display({ validity_value, validity_to_certainty })
    if (is_invalid_for_display) return null


    // TODO next:
    // * extract this to a function to be used by connection
    // * Add another `validity_to_certainty` option of hide_maybe_invalid
    const validity_opacity: number = (is_highlighted || is_selected || is_current_item) ? 1
        : (validity_value.certainty === 1 ? 1 : rescale(validity_value.certainty, 0.1, 0.5))


    const on_pointer_down = (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) =>
    {
        e.stopImmediatePropagation()
        e.preventDefault()

        clicked_wcomponent({ id })

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


    const title = get_title({ wcomponent, rich_text: true, wcomponents_by_id, wc_id_counterfactuals_map, created_at_ms, sim_ms })


    const extra_css_class = (
        ` wcomponent_canvas_node `
        + (node_is_moving ? " node_is_moving " : "")
        + (is_highlighted ? " node_is_highlighted " : "")
        + (is_current_item ? " node_is_current_item " : "")
        + (is_selected ? " node_is_selected " : "")
        + (wcomponent_is_action(wcomponent) ? " node_is_action " : "")
        + ((props.editing || is_highlighted || is_current_item) ? " compact_display " : "")
    )
    const glow = is_highlighted ? "orange" : ((is_selected || is_current_item) && "blue")


    const show_validity_value = props.editing || is_highlighted || is_current_item
    const show_state_value = (props.editing && wcomponent_should_have_state(wcomponent))
        || wcomponent_has_legitimate_non_empty_state(wcomponent)
        || is_highlighted || is_current_item


    return <ConnectableCanvasNode
        position={kv_entry}
        node_main_content={<div>
            <div className="description_label">
                {wcomponent.type}
            </div>
            <div className="node_title">
                <Markdown options={{ forceInline: true }}>{title}</Markdown>
            </div>

            {show_validity_value && <div className="node_validity_container">
                <div className="description_label">validity</div>
                <WComponentValidityValue wcomponent={wcomponent} />
            </div>}

            {show_state_value && <div className="node_state_container">
                <div className="description_label">state</div>
                <WComponentStatefulValue wcomponent={wcomponent} />
                <WComponentJudgements wcomponent={wcomponent} />
            </div>}
        </div>}
        extra_css_class={extra_css_class}
        extra_node_styles={{ opacity: validity_opacity }}
        unlimited_width={false}
        glow={glow}
        color={wcomponent_is_action(wcomponent) ? "rgb(255, 238, 198)" : ""}
        on_pointer_down={on_pointer_down}
        on_pointer_enter={() => set_highlighted_wcomponent({ id, highlighted: true })}
        on_pointer_leave={() => set_highlighted_wcomponent({ id, highlighted: false })}
        terminals={(is_highlighted || props.editing) ? terminals_with_label : terminals_without_label}
        pointerupdown_on_connection_terminal={(connection_location, up_down) => props.pointerupdown_on_connection_terminal({ terminal_type: connection_location, up_down, wcomponent_id: id })}
        extra_args={{
            // draggable: node_allowed_to_move && node_is_moving,
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



const terminals_with_label: Terminal[] = []
const terminals_without_label: Terminal[] = []

connection_terminal_attributes.forEach(attribute =>
{
    connection_terminal_directions.forEach(direction =>
    {
        const type = { attribute, direction }
        const connection_style: h.JSX.CSSProperties = get_top_left_for_terminal_type(type)
        const label = type.attribute.slice(0, 1).toUpperCase()

        terminals_with_label.push({ type, style: connection_style, label })
        terminals_without_label.push({ type, style: connection_style, label: "" })
    })
})
