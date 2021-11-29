import Markdown from "markdown-to-jsx"
import { FunctionalComponent, h } from "preact"
import { useMemo, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { Box, makeStyles } from "@material-ui/core"

import "./WComponentCanvasNode.scss"
import {
    ConnectionTerminalType,
    connection_terminal_attributes,
    connection_terminal_directions,
    WComponent,
    WComponentsById,
    wcomponent_can_have_validity_predictions,
    wcomponent_has_legitimate_non_empty_state_VAP_sets,
    wcomponent_has_objectives,
    wcomponent_has_validity_predictions,
    wcomponent_is_action,
    wcomponent_is_goal,
    wcomponent_is_judgement_or_objective,
    wcomponent_is_statev2,
    wcomponent_is_sub_state,
    wcomponent_should_have_state_VAP_sets,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import { ConnectableCanvasNode } from "../../canvas/ConnectableCanvasNode"
import { Terminal, get_top_left_for_terminal_type } from "../../canvas/connections/terminal"
import type { CanvasPoint } from "../../canvas/interfaces"
import { round_canvas_point } from "../../canvas/position_utils"
import { SCALE_BY } from "../../canvas/zoom_utils"
import { LabelsListV2 } from "../../labels/LabelsListV2"
import type { KnowledgeViewWComponentEntry } from "../../shared/interfaces/knowledge_view"
import { get_title } from "../../wcomponent_derived/rich_text/get_rich_text"
import { wcomponent_type_to_text } from "../../wcomponent_derived/wcomponent_type_to_text"
import { MARKDOWN_OPTIONS } from "../../sharedf/RichMarkDown"
import { WarningTriangle } from "../../sharedf/WarningTriangle"
import { ACTIONS } from "../../state/actions"
import {
    is_on_current_knowledge_view,
    get_wcomponent_from_state,
    get_current_temporal_value_certainty_from_wcomponent,
} from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { get_store } from "../../state/store"
import { calc_wcomponent_should_display, calc_display_opacity } from "../calc_should_display"
import { factory_on_click } from "../canvas_common"
import { WComponentJudgements } from "./WComponentJudgements"
import { NodeValueAndPredictionSetSummary } from "./NodeValueAndPredictionSetSummary"
import { WComponentValidityValue } from "./WComponentValidityValue"
import { Handles } from "./Handles"
import { NodeSubStateSummary } from "./NodeSubStateSummary"
import { get_wc_id_to_counterfactuals_v2_map } from "../../state/derived/accessor"
import { NodeSubStateTypeIndicators } from "./NodeSubStateTypeIndicators"
import { pub_sub } from "../../state/pub_sub/pub_sub"
import { get_uncertain_datetime } from "../../shared/uncertainty/datetime"



interface OwnProps
{
    id: string
    is_movable?: boolean
    always_show?: boolean
    drag_relative_position?: CanvasPoint | undefined
}



const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { id: wcomponent_id } = own_props

    const shift_or_control_keys_are_down = state.global_keys.derived.shift_or_control_down

    const on_current_knowledge_view = is_on_current_knowledge_view(state, wcomponent_id)
    const { current_composed_knowledge_view } = state.derived


    let have_judgements = false
    if (current_composed_knowledge_view)
    {
        have_judgements = !!(current_composed_knowledge_view.active_judgement_or_objective_ids_by_target_id[wcomponent_id] || current_composed_knowledge_view.active_judgement_or_objective_ids_by_goal_or_action_id[wcomponent_id])
    }


    return {
        on_current_knowledge_view,
        current_composed_knowledge_view,
        wcomponent: get_wcomponent_from_state(state, wcomponent_id),
        wc_id_to_counterfactuals_map: get_wc_id_to_counterfactuals_v2_map(state),
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        is_current_item: state.routing.item_id === wcomponent_id,
        selected_wcomponent_ids_set: state.meta_wcomponents.selected_wcomponent_ids_set,
        is_highlighted: state.meta_wcomponents.highlighted_wcomponent_ids.has(wcomponent_id),
        shift_or_control_keys_are_down,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        is_editing: !state.display_options.consumption_formatting,
        validity_filter: state.display_options.derived_validity_filter,
        certainty_formatting: state.display_options.derived_certainty_formatting,
        focused_mode: state.display_options.focused_mode,
        have_judgements,
        wcomponent_ids_to_move_set: state.meta_wcomponents.wcomponent_ids_to_move_set,
        display_time_marks: state.display_options.display_time_marks,
        connected_neighbour_is_highlighted: state.meta_wcomponents.neighbour_ids_of_highlighted_wcomponent.has(wcomponent_id),
    }
}



const map_dispatch = {
    clicked_wcomponent: ACTIONS.specialised_object.clicked_wcomponent,
    clear_selected_wcomponents: ACTIONS.specialised_object.clear_selected_wcomponents,
    change_route: ACTIONS.routing.change_route,
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
    pointerupdown_on_component: ACTIONS.specialised_object.pointerupdown_on_component,
    pointerupdown_on_connection_terminal: ACTIONS.specialised_object.pointerupdown_on_connection_terminal,
    set_wcomponent_ids_to_move: ACTIONS.specialised_object.set_wcomponent_ids_to_move,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCanvasNode (props: Props)
{
    const [node_is_draggable, set_node_is_draggable] = useState(false)

    const {
        id,
        is_movable = true, always_show = false,
        is_editing,
        current_composed_knowledge_view: composed_kv, wcomponent, wc_id_to_counterfactuals_map, wcomponents_by_id,
        is_current_item, selected_wcomponent_ids_set, is_highlighted,
        shift_or_control_keys_are_down,
        created_at_ms, sim_ms, validity_filter, certainty_formatting,
        clicked_wcomponent, clear_selected_wcomponents,
    } = props
    const { change_route, set_highlighted_wcomponent } = props

    if (!composed_kv) return <div>No current knowledge view</div>
    // if (!wcomponent) return <div>Could not find component of id {id}</div>


    const kv_entry_maybe = composed_kv.composed_wc_id_map[id]
    if (!kv_entry_maybe && !always_show) return <div>Could not find knowledge view entry for id {id}</div>
    // Provide a default kv_entry value for when this node is being in a different context e.g.
    // when prioritisation nodes are being rendered on the Priorities list
    const kv_entry = kv_entry_maybe || { left: 0, top: 0 }
    let temporary_drag_kv_entry: KnowledgeViewWComponentEntry | undefined = undefined
    if (props.drag_relative_position)
    {
        temporary_drag_kv_entry = { ...kv_entry }
        temporary_drag_kv_entry.left += props.drag_relative_position.left
        temporary_drag_kv_entry.top += props.drag_relative_position.top
    }


    const { wc_ids_excluded_by_filters } = composed_kv.filters
    const validity_value = (always_show || !wcomponent) ? { display_certainty: 1 } : calc_wcomponent_should_display({
        is_editing, wcomponent, kv_entry, created_at_ms, sim_ms, validity_filter,
        selected_wcomponent_ids_set, wc_ids_excluded_by_filters,
    })
    if (!validity_value) return null


    const is_selected = selected_wcomponent_ids_set.has(id)
    const validity_opacity = calc_display_opacity({
        is_editing,
        certainty: validity_value.display_certainty,
        is_highlighted,
        connected_neighbour_is_highlighted: props.connected_neighbour_is_highlighted,
        is_selected,
        is_current_item,
        certainty_formatting,
        focused_mode: props.focused_mode,
    })

    const node_is_moving = props.wcomponent_ids_to_move_set.has(id)
    const opacity = props.drag_relative_position ? 0.3
        : node_is_moving ? 0 : validity_opacity


    const on_click = factory_on_click({
        wcomponent_id: id,
        clicked_wcomponent,
        clear_selected_wcomponents,
        shift_or_control_keys_are_down,
        change_route,
        is_current_item,
    })


    const children: h.JSX.Element[] = !wcomponent ? [] : [
        <Handles
            show_move_handle={is_movable && is_editing && is_highlighted}
            user_requested_node_move={() =>
            {
                if (!selected_wcomponent_ids_set.has(id))
                {
                    props.clicked_wcomponent({ id })
                }
                set_node_is_draggable(true)
            }}
            wcomponent_id={wcomponent.id}
            wcomponent_current_kv_entry={kv_entry}
            is_highlighted={is_highlighted}
        />
    ]


    const title = !wcomponent ? "&lt;Not found&gt;" : get_title({ wcomponent, rich_text: true, wcomponents_by_id, wc_id_to_counterfactuals_map, created_at_ms, sim_ms })


    const show_all_details = is_editing //|| is_current_item

    const use_styles = makeStyles(theme => ({
        sizer: {
            transform: `scale(${kv_entry.s ? kv_entry.s : 1 })`,
            // @NOTE: The transformOrigin defaults to center center (50% 50%), but this may not be
            // best for determining position of connectors, values can be set
            // with keywords left/right/center or top/center/bottom
            // or percents, and the order is x-axis, y-axis

            // transformOrigin: "center center"
            transformOrigin: "left top",
        }
    }))
    const classes = use_styles()
    const glow = is_highlighted ? "orange" : ((is_selected || is_current_item) && "blue")
    const color = get_wcomponent_color({
        wcomponent, wcomponents_by_id, sim_ms, created_at_ms, display_time_marks: props.display_time_marks,
    })

    const extra_css_class = (
        ` wcomponent_canvas_node `
        + (is_editing ? (props.on_current_knowledge_view ? " node_on_kv " : " node_on_foundational_kv ") : "")
        + (node_is_moving ? " node_is_moving " : "")
        + (temporary_drag_kv_entry ? " node_is_temporary_dragged_representation " : "")
        + (is_highlighted ? " node_is_highlighted " : "")
        + (is_current_item ? " node_is_current_item " : "")
        + (is_selected ? " node_is_selected " : "")
        + (wcomponent ? ` node_is_type_${wcomponent.type} ` : "")
        + (show_all_details ? " compact_title " : "")
        + color.font
        + color.background
    )


    let show_validity_value = false
    let show_state_value = false

    if (wcomponent)
    {
        show_validity_value = (wcomponent_can_have_validity_predictions(wcomponent) && is_editing) || (wcomponent_has_validity_predictions(wcomponent) && is_current_item)

        show_state_value = (is_editing && wcomponent_should_have_state_VAP_sets(wcomponent))
        || (!wcomponent.hide_state && (
            wcomponent_has_legitimate_non_empty_state_VAP_sets(wcomponent)
            || wcomponent_is_judgement_or_objective(wcomponent)
            || (wcomponent_has_objectives(wcomponent) && (wcomponent.objective_ids || []).length > 0)
            // || is_highlighted
            // || is_current_item
            || props.have_judgements
        ))
    }

    const sub_state_wcomponent = !wcomponent ? false : (is_editing || !wcomponent.hide_state) && wcomponent_is_sub_state(wcomponent) && wcomponent

    const terminals = get_terminals({ is_movable, is_editing, is_highlighted })

    // const show_judgements_when_no_state_values = (wcomponent_is_statev2(wcomponent) && (!wcomponent.values_and_prediction_sets || wcomponent.values_and_prediction_sets.length === 0))


    const on_pointer_down = (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) =>
    {
        e.stopImmediatePropagation()
        e.preventDefault()

        props.pointerupdown_on_component({ up_down: "down", wcomponent_id: id })
    }

    const on_pointer_up = (e: h.JSX.TargetedEvent<HTMLDivElement, PointerEvent>) =>
    {
        e.stopImmediatePropagation()
        e.preventDefault()

        props.pointerupdown_on_component({ up_down: "up", wcomponent_id: id })
    }

    const pointerupdown_on_connection_terminal = (connection_location: ConnectionTerminalType, up_down: "up" | "down") => props.pointerupdown_on_connection_terminal({
        terminal_type: connection_location, up_down, wcomponent_id: id
    })


    return <ConnectableCanvasNode
        position={is_movable ? (temporary_drag_kv_entry || kv_entry) : undefined}
        cover_image={wcomponent?.summary_image}
        node_main_content={<div>
            {!wcomponent?.summary_image && <div className="background_image" />}

            <div className="node_title">
                {kv_entry_maybe === undefined && is_editing && <span>
                    <WarningTriangle message="Missing from this knowledge view" />
                    &nbsp;
                </span>}
                {(is_editing || !wcomponent?.hide_title) && <Markdown options={{ ...MARKDOWN_OPTIONS, forceInline: true }}>{title}</Markdown>}
            </div>

            {wcomponent && show_validity_value && <div className="node_validity_container">
                {is_editing && <div className="description_label">validity</div>}
                <WComponentValidityValue wcomponent={wcomponent} />
            </div>}

            {wcomponent && show_state_value && <Box display="flex" maxWidth="100%" overflow="hidden" className="node_state_container">
                {is_editing && <div className="description_label">state &nbsp;</div>}
                <WComponentJudgements wcomponent={wcomponent} />
                <Box flexGrow={1} flexShrink={1} overflow="hidden">
                    <NodeValueAndPredictionSetSummary
                        wcomponent={wcomponent}
                        created_at_ms={created_at_ms}
                        sim_ms={sim_ms}
                    />
                </Box>
            </Box>}

            {sub_state_wcomponent && <Box display="flex" maxWidth="100%" overflow="hidden" className="node_sub_state_container">
                <Box flexGrow={1} flexShrink={1} overflow="hidden">
                    <NodeSubStateSummary
                        wcomponent={sub_state_wcomponent}
                        created_at_ms={created_at_ms}
                        sim_ms={sim_ms}
                    />
                </Box>
            </Box>}

            {sub_state_wcomponent && <NodeSubStateTypeIndicators wcomponent={sub_state_wcomponent} />}

            {wcomponent && is_editing && <div className="description_label">
                {wcomponent_type_to_text(wcomponent.type)}
            </div>}

            {wcomponent && <LabelsListV2 label_ids={wcomponent.label_ids} />}
        </div>}
        extra_css_class={extra_css_class}
        extra_css_class_node_main_content={classes.sizer}
        opacity={opacity}
        unlimited_width={false}
        glow={glow}
        on_click={on_click}
        on_pointer_enter={() => set_highlighted_wcomponent({ id, highlighted: true })}
        on_pointer_leave={() => set_highlighted_wcomponent({ id, highlighted: false })}
        terminals={terminals}
        on_pointer_down={on_pointer_down}
        on_pointer_up={on_pointer_up}
        pointerupdown_on_connection_terminal={pointerupdown_on_connection_terminal}
        extra_args={{
            draggable: node_is_draggable,
            onDragStart: e =>
            {
                props.set_wcomponent_ids_to_move({ wcomponent_ids_to_move: selected_wcomponent_ids_set })
                // pub_sub.canvas.pub("canvas_node_drag_wcomponent_ids", wcomponent_ids_to_move)

                // Prevent green circle with white cross "copy / add" cursor icon
                // https://stackoverflow.com/a/56699962/539490
                e.dataTransfer!.dropEffect = "move"
            },

            onDrag: e =>
            {
                const new_relative_position = calculate_new_node_relative_position_from_drag(e, kv_entry.s)
                pub_sub.canvas.pub("canvas_node_drag_relative_position", new_relative_position)
            },

            onDragEnd: e => {
                pub_sub.canvas.pub("canvas_node_drag_relative_position", undefined)
                set_node_is_draggable(false)
            }
        }}
        other_children={children}
    />
}

export const WComponentCanvasNode = connector(_WComponentCanvasNode) as FunctionalComponent<OwnProps>



const no_terminals: Terminal[] = []
const terminals_with_label: Terminal[] = []

connection_terminal_attributes.forEach(attribute =>
{
    connection_terminal_directions.forEach(direction =>
    {
        const type = { attribute, direction }
        const connection_style: h.JSX.CSSProperties = get_top_left_for_terminal_type(type)
        const label = type.attribute.slice(0, 1).toUpperCase()

        terminals_with_label.push({ type, style: connection_style, label })
    })
})



function get_terminals (args: { is_movable: boolean; is_editing: boolean; is_highlighted: boolean })
{
    if (!args.is_movable) return no_terminals
    if (!args.is_editing) return no_terminals
    if (!args.is_highlighted) return no_terminals

    return terminals_with_label
}



interface GetWcomponentColorArgs
{
    wcomponent?: WComponent
    wcomponents_by_id: WComponentsById
    created_at_ms: number
    sim_ms: number
    display_time_marks: boolean | undefined
}
function get_wcomponent_color (args: GetWcomponentColorArgs)
{
    let background = ""
    let font = ""

    if (args.wcomponent)
    {
        if (args.display_time_marks)
        {
            const temporal_value_certainty = get_current_temporal_value_certainty_from_wcomponent(args.wcomponent.id, args.wcomponents_by_id, args.created_at_ms)
            if (temporal_value_certainty)
            {
                const { temporal_uncertainty, certainty } = temporal_value_certainty
                const datetime = get_uncertain_datetime(temporal_uncertainty)
                if (datetime && datetime.getTime() < args.sim_ms)
                {
                    if (certainty === 1 || certainty === undefined)
                    {
                        background = " past_certain "
                        font = " color_light "
                    }
                    else
                    {
                        // Warning that either you need to update your data or this is warning that this is uncertain
                        background = " past_uncertain "
                    }
                }
                else if (!datetime) // is eternal
                {
                    if (certainty === 1 || certainty === undefined)
                    {
                        background = " past_certain "
                        font = " color_light "
                    }
                }

            }
        }
        else
        {
            // background = wcomponent_is_action(args.wcomponent) ? "rgb(255, 238, 198)"
            //     : ((wcomponent_is_goal(args.wcomponent)
            //     // || wcomponent_is_judgement_or_objective(wcomponent)
            //     ) ? "rgb(207, 255, 198)" : "")
        }
    }
    else
    {
        background = " node_missing "
    }

    return { background, font }
}



function calculate_new_node_relative_position_from_drag (e: h.JSX.TargetedDragEvent<HTMLDivElement>, kv_entry_size?: number)
{
    const scale = get_scale()
    const top_fudge = -18 * (scale / 2)
    const left_fudge = 8 / (scale / 2)
    // maybe explore using e.currentTarget.offsetLeft?
    const node_size_fudge = kv_entry_size ?? 1
    // Note that e.offsetY and e.offsetX do NOT take into account the position the user's cursor was
    // relative to the move icon when it was clicked.  However the drag annimation provided by the browser
    // does so that means the position will usually be wrong in one or both dimensions.
    // TODO find a value which does reflect where the user pressed down on the move icon
    const top = (e.offsetY * node_size_fudge) + top_fudge
    const left = (e.offsetX * node_size_fudge) + left_fudge
    // console .log(`${kv_entry.top} ${e.offsetY} ${e.y}  =  ${top}`);
    // console .log(`${kv_entry.left} ${e.offsetX} ${e.x} =  ${left}`);
    const new_relative_position = round_canvas_point({ top, left })
    return new_relative_position
}



function get_scale ()
{
    const store = get_store()
    const zoom = store.getState().routing.args.zoom
    return zoom / SCALE_BY
}



function calculate_new_position (kv_entry: KnowledgeViewWComponentEntry, new_relative_position: CanvasPoint)
{
    return {
        ...kv_entry,
        left: kv_entry.left + new_relative_position.left,
        top: kv_entry.top + new_relative_position.top,
    }
}
