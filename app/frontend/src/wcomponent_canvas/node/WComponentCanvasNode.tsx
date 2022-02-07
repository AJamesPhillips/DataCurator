import Markdown from "markdown-to-jsx"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { makeStyles } from "@material-ui/core"
import DescriptionIcon from "@material-ui/icons/Description"

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
    wcomponent_is_judgement_or_objective,
    wcomponent_is_sub_state,
    wcomponent_should_have_state_VAP_sets,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import { ConnectableCanvasNode } from "../../canvas/ConnectableCanvasNode"
import { Terminal, get_top_left_for_terminal_type } from "../../canvas/connections/terminal"
import type { CanvasPoint, CanvasPointerEvent, Position } from "../../canvas/interfaces"
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
import { calc_wcomponent_should_display, calc_display_opacity } from "../calc_should_display"
import { factory_on_click } from "../canvas_common"
import { WComponentJudgements } from "./WComponentJudgements"
import { NodeValueAndPredictionSetSummary } from "./NodeValueAndPredictionSetSummary"
import { WComponentValidityValue } from "./WComponentValidityValue"
import { Handles } from "./Handles"
import { NodeSubStateSummary } from "./NodeSubStateSummary"
import { get_wc_id_to_counterfactuals_v2_map } from "../../state/derived/accessor"
import { NodeSubStateTypeIndicators } from "./NodeSubStateTypeIndicators"
import { get_uncertain_datetime } from "../../shared/uncertainty/datetime"
import {
    start_moving_wcomponents,
} from "../../state/specialised_objects/wcomponents/bulk_edit/start_moving_wcomponents"
import { useEffect, useState } from "preact/hooks"
import { pub_sub } from "../../state/pub_sub/pub_sub"
import { color_to_string, darker_color } from "../../sharedf/color"
import { default_frame_color } from "../../wcomponent_form/wcomponent_knowledge_view_form/default_frame_color"
import { grid_small_step } from "../../canvas/position_utils"
import { WComponentCanvasNodeBackgroundFrame } from "./WComponentCanvasNodeBackgroundFrame"
import { get_current_VAP_set } from "../../wcomponent_derived/value_and_prediction/get_current_v2_VAP_set"
import { get_wcomponent_state_value_and_probabilities } from "../../wcomponent_derived/get_wcomponent_state_value"
import { ACTION_VALUE_POSSIBILITY_ID } from "../../wcomponent/value/parse_value"



interface OwnProps
{
    id: string
    is_on_canvas?: boolean
    always_show?: boolean
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
        node_is_moving: state.meta_wcomponents.wcomponent_ids_to_move_set.has(wcomponent_id),
        display_time_marks: state.display_options.display_time_marks,
        connected_neighbour_is_highlighted: state.meta_wcomponents.neighbour_ids_of_highlighted_wcomponent.has(wcomponent_id),
    }
}



const map_dispatch = {
    clicked_wcomponent: ACTIONS.meta_wcomponents.clicked_wcomponent,
    clear_selected_wcomponents: ACTIONS.meta_wcomponents.clear_selected_wcomponents,
    change_route: ACTIONS.routing.change_route,
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
    pointerupdown_on_component: ACTIONS.meta_wcomponents.pointerupdown_on_component,
    pointerupdown_on_connection_terminal: ACTIONS.meta_wcomponents.pointerupdown_on_connection_terminal,
    set_wcomponent_ids_to_move: ACTIONS.meta_wcomponents.set_wcomponent_ids_to_move,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCanvasNode (props: Props)
{
    // const [node_is_draggable, set_node_is_draggable] = useState(false)

    const {
        id,
        is_on_canvas = true, always_show = false,
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


    const [temporary_drag_kv_entry, set_temporary_drag_kv_entry] = useState<KnowledgeViewWComponentEntry | undefined>(undefined)
    useEffect(() =>
    {
        if (!props.node_is_moving) return

        const unsubscribe = pub_sub.canvas.sub("throttled_canvas_node_drag_relative_position", drag_relative_position =>
        {
            const temp_drag_kv_entry = { ...kv_entry }
            temp_drag_kv_entry.left += drag_relative_position.left
            temp_drag_kv_entry.top += drag_relative_position.top
            set_temporary_drag_kv_entry(temp_drag_kv_entry)
        })

        return () =>
        {
            set_temporary_drag_kv_entry(undefined)
            unsubscribe()
        }
    }, [props.node_is_moving])


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

    const opacity = props.node_is_moving ? 0.3 : validity_opacity

    const on_click = factory_on_click({
        wcomponent_id: id,
        clicked_wcomponent,
        clear_selected_wcomponents,
        shift_or_control_keys_are_down,
        change_route,
        is_current_item,
    })


    const children: h.JSX.Element[] = (!wcomponent || props.node_is_moving) ? [] : [
        <Handles
            show_move_handle={is_on_canvas && is_editing && is_highlighted}
            user_requested_node_move={(position: Position) =>
            {
                let wcomponent_ids_to_move = new Set(selected_wcomponent_ids_set)
                if (!wcomponent_ids_to_move.has(id))
                {
                    wcomponent_ids_to_move = new Set([id])
                    // Deselects the other components and selects only this component
                    props.clicked_wcomponent({ id })
                }
                start_moving_wcomponents(wcomponent_ids_to_move, position)
            }}
            wcomponent_id={id}
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
        + (props.node_is_moving ? " node_is_moving " : "")
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

    const terminals = get_terminals({ is_on_canvas, is_editing, is_highlighted })

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


    const _kv_entry = is_on_canvas ? (temporary_drag_kv_entry || kv_entry) : undefined


    return <div>
        <WComponentCanvasNodeBackgroundFrame
            wcomponent_id={id} kv_entry={_kv_entry}
        />

        <ConnectableCanvasNode
            position={_kv_entry}
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

                {wcomponent && show_state_value && <div className="node_state_container">
                    {is_editing && <div className="description_label">state &nbsp;</div>}
                    <WComponentJudgements wcomponent={wcomponent} hide_judgement_trend={false} />
                    <div className="value_and_prediction_summary">
                        <NodeValueAndPredictionSetSummary
                            wcomponent={wcomponent}
                            created_at_ms={created_at_ms}
                            sim_ms={sim_ms}
                        />
                    </div>
                </div>}

                {sub_state_wcomponent && <div className="node_sub_state_container">
                    {// todo call this class something different from "value_and_prediction_summary"
                    }
                    <div className="value_and_prediction_summary">
                        <NodeSubStateSummary
                            wcomponent={sub_state_wcomponent}
                            created_at_ms={created_at_ms}
                            sim_ms={sim_ms}
                        />
                    </div>
                </div>}

                {sub_state_wcomponent && <NodeSubStateTypeIndicators wcomponent={sub_state_wcomponent} />}

                {wcomponent && is_editing && <div className="description_label">
                    {wcomponent_type_to_text(wcomponent.type)}
                </div>}

                <div style={{ display: "flex" }}>
                    {wcomponent?.description.trim() && <DescriptionIcon
                        fontSize="small"
                        color="disabled"
                    />}

                    {wcomponent && <LabelsListV2 label_ids={wcomponent.label_ids} />}
                </div>
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
            other_children={children}
        />
    </div>
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



function get_terminals (args: { is_on_canvas: boolean; is_editing: boolean; is_highlighted: boolean })
{
    if (!args.is_on_canvas) return no_terminals
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

    const { wcomponent, created_at_ms, sim_ms } = args

    if (!wcomponent) return { background: " node_missing ", font }


    if (wcomponent_is_action(wcomponent))
    {
        const attribute_values = get_wcomponent_state_value_and_probabilities({
            wcomponent,
            VAP_set_id_to_counterfactual_v2_map: {}, created_at_ms, sim_ms,
        })
        const most_probable = attribute_values.most_probable_VAP_set_values[0]

        if (attribute_values.any_uncertainty)
        {
            // Warning that either you need to update your data or this is warning that this is uncertain
            background = " past_uncertain "
        }
        else if (most_probable)
        {
            const completed = most_probable.value_id === ACTION_VALUE_POSSIBILITY_ID.action_completed
                || most_probable.value_id === ACTION_VALUE_POSSIBILITY_ID.action_failed
                || most_probable.value_id === ACTION_VALUE_POSSIBILITY_ID.action_rejected

            if (completed)
            {
                background = " past_certain "
                font = " color_light "
            }
        }
    }
    else
    {
        // if (args.display_time_marks)
        // {
            const temporal_value_certainty = get_current_temporal_value_certainty_from_wcomponent(wcomponent.id, args.wcomponents_by_id, created_at_ms)
            if (temporal_value_certainty)
            {
                const { temporal_uncertainty, certainty } = temporal_value_certainty
                const datetime = get_uncertain_datetime(temporal_uncertainty)
                if (datetime && datetime.getTime() < sim_ms)
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
        // }
        // else
        // {
        //     // background = wcomponent_is_action(args.wcomponent) ? "rgb(255, 238, 198)"
        //     //     : ((wcomponent_is_goal(args.wcomponent)
        //     //     // || wcomponent_is_judgement_or_objective(wcomponent)
        //     //     ) ? "rgb(207, 255, 198)" : "")
        // }
    }

    return { background, font }
}
