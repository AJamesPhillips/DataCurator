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
    WComponent,
    wcomponent_can_have_validity_predictions,
    wcomponent_has_legitimate_non_empty_state,
    wcomponent_is_action,
    wcomponent_is_goal,
    wcomponent_is_judgement_or_objective,
    wcomponent_should_have_state,
} from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { KnowledgeViewWComponentEntry } from "../../shared/wcomponent/interfaces/knowledge_view"
import { ACTIONS } from "../../state/actions"
import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { calc_display_opacity, calc_wcomponent_should_display } from "../calc_display_parameters"
import { WComponentStatefulValue } from "../WComponentStatefulValue"
import { WComponentJudgements } from "../judgements/WComponentJudgements"
import { get_title } from "../../shared/wcomponent/rich_text/get_rich_text"
import { round_canvas_point } from "../../canvas/position_utils"
import { Handles } from "./Handles"
import { get_wc_id_counterfactuals_map } from "../../state/derived/accessor"
import { WComponentValidityValue } from "../WComponentValidityValue"
import { get_top_left_for_terminal_type, Terminal } from "../../canvas/connections/terminal"



interface OwnProps
{
    id: string
    on_graph?: boolean
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
        is_editing: !state.display_options.consumption_formatting,
        validity_filter: state.display_options.derived_validity_filter,
        certainty_formatting: state.display_options.derived_certainty_formatting,
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

    const {
        id, on_graph = true,
        knowledge_view_id, kv_entry, wcomponent, wc_id_counterfactuals_map, wcomponents_by_id,
        is_current_item, is_selected, is_highlighted,
        ctrl_key_is_down,
        created_at_ms, sim_ms, validity_filter, certainty_formatting, } = props
    const { change_route, set_highlighted_wcomponent } = props

    if (!knowledge_view_id) return <div>No current knowledge view</div>
    if (!wcomponent) return <div>Could not find component of id {id}</div>
    if (!kv_entry) return <div>Could not find knowledge view entry for id {id}</div>


    const validity_value = calc_wcomponent_should_display({
        wcomponent, created_at_ms, sim_ms, validity_filter
    })
    if (!validity_value) return null


    const validity_opacity = calc_display_opacity({
        is_editing: props.is_editing,
        certainty: validity_value.certainty,
        is_highlighted,
        is_selected,
        is_current_item,
        certainty_formatting: certainty_formatting,
    })


    const on_pointer_down = (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) =>
    {
        e.stopImmediatePropagation()
        e.preventDefault()

        props.clicked_wcomponent({ id })

        if (ctrl_key_is_down)
        {
            change_route({ route: "wcomponents", sub_route: "wcomponents_edit_multiple", item_id: null })
        }
        else
        {
            // Copied to connection
            if (is_current_item)
            {
                change_route({ route: "wcomponents", sub_route: null, item_id: null })
                props.clear_selected_wcomponents({})
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
            set_node_is_moving={!on_graph ? undefined : (() => set_node_is_moving(true))}
        />)
    }


    const title = get_title({ wcomponent, rich_text: true, wcomponents_by_id, wc_id_counterfactuals_map, created_at_ms, sim_ms })


    const extra_css_class = (
        ` wcomponent_canvas_node `
        + (node_is_moving ? " node_is_moving " : "")
        + (is_highlighted ? " node_is_highlighted " : "")
        + (is_current_item ? " node_is_current_item " : "")
        + (is_selected ? " node_is_selected " : "")
        + ` node_is_type_${wcomponent.type} `
        + ((props.is_editing || is_highlighted || is_current_item) ? " compact_display " : "")
    )
    const glow = is_highlighted ? "orange" : ((is_selected || is_current_item) && "blue")
    const color = get_wcomponent_color(wcomponent)


    const show_validity_value = (props.is_editing || is_highlighted || is_current_item) && wcomponent_can_have_validity_predictions(wcomponent)
    const show_state_value = (props.is_editing && wcomponent_should_have_state(wcomponent))
        || wcomponent_has_legitimate_non_empty_state(wcomponent)
        || wcomponent_is_judgement_or_objective(wcomponent)
        || (wcomponent_is_goal(wcomponent) && wcomponent.objective_ids.length > 0)
        || is_highlighted || is_current_item


    const terminals = !on_graph ? [] : ((is_highlighted || props.is_editing) ? terminals_with_label : terminals_without_label)


    return <ConnectableCanvasNode
        position={on_graph ? kv_entry : undefined}
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
        color={color}
        on_pointer_down={on_pointer_down}
        on_pointer_enter={() => set_highlighted_wcomponent({ id, highlighted: true })}
        on_pointer_leave={() => set_highlighted_wcomponent({ id, highlighted: false })}
        terminals={terminals}
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



function get_wcomponent_color (wcomponent: WComponent)
{
    return wcomponent_is_action(wcomponent) ? "rgb(255, 238, 198)"
        : ((wcomponent_is_goal(wcomponent) /* || wcomponent_is_objective(wcomponent) */) ? "rgb(207, 255, 198)" : "")
}
