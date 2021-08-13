import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./WComponentCanvasConnection.scss"
import { CanvasConnnection } from "../canvas/connections/CanvasConnnection"
import type { WComponentJudgement } from "../shared/wcomponent/interfaces/judgement"
import type {
    KnowledgeViewWComponentIdEntryMap,
    KnowledgeViewWComponentEntry,
} from "../shared/wcomponent/interfaces/knowledge_view"
import {
    WComponent,
    wcomponent_is_plain_connection,
    wcomponent_can_render_connection,
    ConnectionTerminalType,
    wcomponent_is_judgement_or_objective,
    wcomponent_is_causal_link,
    wcomponent_is_statev2,
    WComponentConnection,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../state/actions"
import { get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import {
    calc_connection_wcomponent_should_display,
    calc_display_opacity,
    calc_judgement_connection_wcomponent_should_display,
} from "./calc_display_parameters"
import { factory_on_pointer_down } from "./canvas_common"
import { get_props_for_get_counterfactual_v2_VAP_set } from "../state/specialised_objects/counterfactuals/get_props_for_state_v2"
import { get_counterfactual_v2_VAP_set, get_current_VAP_set } from "../shared/wcomponent/value_and_prediction/get_value_v2"
import { get_VAP_visuals_data } from "../shared/counterfactuals/convert_VAP_sets_to_visual_VAP_sets"
import { wcomponent_VAPs_represent } from "../shared/wcomponent/value_and_prediction/utils"
import { VAPsType } from "../shared/wcomponent/interfaces/generic_value"
import { bounded } from "../shared/utils/bounded"
import { ConnectionEndType } from "../canvas/connections/ConnectionEnd"



interface OwnProps
{
    id: string
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const wcomponent = get_wcomponent_from_state(state, own_props.id)

    const { force_display: force_displaying } = state.filter_context
    const is_selected = state.meta_wcomponents.selected_wcomponent_ids_set.has(own_props.id)
    const { current_composed_knowledge_view: composed_kv } = state.derived
    const { created_at_ms, sim_ms } = state.routing.args
    const { derived_validity_filter: validity_filter } = state.display_options

    let validity_value: false | { display_certainty: number } = false
    let from_wc: WComponent | undefined = undefined
    let to_wc: WComponent | undefined = undefined

    let connection_effect: number | undefined = undefined

    if (!wcomponent || !composed_kv) ""
    else
    {
        const { wc_ids_excluded_by_filters } = composed_kv.filters


        if (wcomponent_is_plain_connection(wcomponent))
        {
            from_wc = get_wcomponent_from_state(state, wcomponent.from_id)
            to_wc = get_wcomponent_from_state(state, wcomponent.to_id)

            validity_value = calc_connection_wcomponent_should_display({
                force_displaying, is_selected, wcomponent, validity_filter, from_wc, to_wc, created_at_ms, sim_ms, wc_ids_excluded_by_filters,
            })

            // TODO move all of this into a derived reducer
            connection_effect = calculate_effect(wcomponent, from_wc, state)
        }
        else if (wcomponent_is_judgement_or_objective(wcomponent))
        {
            const target_wc = get_wcomponent_from_state(state, wcomponent.judgement_target_wcomponent_id)

            validity_value = calc_judgement_connection_wcomponent_should_display({
                force_displaying, is_selected, wcomponent, validity_filter, target_wc, created_at_ms, sim_ms, wc_ids_excluded_by_filters,
            })
        }
    }


    const shift_or_control_keys_are_down = state.global_keys.derived.shift_or_control_down


    return {
        current_composed_knowledge_view: composed_kv,
        wcomponent,
        connection_effect,
        validity_value,
        is_current_item: state.routing.item_id === own_props.id,
        is_selected,
        is_highlighted: state.meta_wcomponents.highlighted_wcomponent_ids.has(own_props.id),
        is_editing: !state.display_options.consumption_formatting,
        certainty_formatting: state.display_options.derived_certainty_formatting,
        shift_or_control_keys_are_down,
        focused_mode: state.display_options.focused_mode,
    }
}



const map_dispatch = {
    clicked_wcomponent: ACTIONS.specialised_object.clicked_wcomponent,
    clear_selected_wcomponents: ACTIONS.specialised_object.clear_selected_wcomponents,
    change_route: ACTIONS.routing.change_route,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCanvasConnection (props: Props)
{
    const {
        id, current_composed_knowledge_view, wcomponent,
        is_current_item, is_highlighted, is_selected,
        validity_value,  connection_effect,
        shift_or_control_keys_are_down,
        change_route, clicked_wcomponent, clear_selected_wcomponents,
    } = props

    if (!wcomponent)
    {
        console.error(`Tried to render a WComponentCanvasConnection of world component id: "${id}" but could not find it`)
        return null
    }

    if (!wcomponent_can_render_connection(wcomponent))
    {
        console.error(`Tried to render a WComponentCanvasConnection of world component id: "${id}" but was not a causal link`)
        return null
    }

    if (!validity_value) return null

    if (!current_composed_knowledge_view)
    {
        console.error(`Tried to render a WComponentCanvasConnection of world component id: "${id}" but no current_composed_knowledge_view`)
        return null
    }


    const on_pointer_down = factory_on_pointer_down({ wcomponent_id: id, clicked_wcomponent, clear_selected_wcomponents, shift_or_control_keys_are_down, change_route, is_current_item })


    const { from_node_position, to_node_position, from_connection_type, to_connection_type,
    } = get_connection_terminal_positions({ wcomponent, wc_id_map: current_composed_knowledge_view.composed_wc_id_map })


    const validity_opacity = calc_display_opacity({
        is_editing: props.is_editing,
        certainty: validity_value.display_certainty,
        is_current_item,
        certainty_formatting: props.certainty_formatting,
        focused_mode: props.focused_mode,
    })


    let thickness = 2
    let connection_end_type = ConnectionEndType.positive
    let effect = ""
    if (connection_effect !== undefined)
    {
        thickness = bounded(Math.abs(connection_effect), 2, 15)
        if (connection_effect < 0)
        {
            connection_end_type = ConnectionEndType.negative
            effect = "negative_connection_effect"
        }
        else if (connection_effect === 0)
        {
            connection_end_type = ConnectionEndType.noop
            effect = "no_connection_effect"
        }
    }

    return <CanvasConnnection
        from_node_position={from_node_position}
        to_node_position={to_node_position}
        from_connection_type={from_connection_type}
        to_connection_type={to_connection_type}
        on_pointer_down={on_pointer_down}
        thickness={thickness}
        connection_end_type={connection_end_type}
        intensity={validity_opacity}
        is_highlighted={is_current_item || is_highlighted || is_selected}
        extra_css_classes={"connection_type_" + wcomponent.type + " " + effect}
    />
}

export const WComponentCanvasConnection = connector(_WComponentCanvasConnection) as FunctionalComponent<OwnProps>



interface GetConnectionTerminalPositionsArgs
{
    wcomponent: WComponentConnection | WComponentJudgement
    wc_id_map: KnowledgeViewWComponentIdEntryMap
}
function get_connection_terminal_positions ({ wcomponent, wc_id_map }: GetConnectionTerminalPositionsArgs)
{
    let from_node_position: KnowledgeViewWComponentEntry | undefined = undefined
    let to_node_position: KnowledgeViewWComponentEntry | undefined = undefined
    let from_connection_type: ConnectionTerminalType // = "top"
    let to_connection_type: ConnectionTerminalType // = "bottom"

    if (wcomponent_is_plain_connection(wcomponent))
    {
        from_node_position = wc_id_map[wcomponent.from_id]
        to_node_position = wc_id_map[wcomponent.to_id]
        from_connection_type = { direction: "from", attribute: wcomponent.from_type }
        to_connection_type = { direction: "to", attribute: wcomponent.to_type }
    }
    else
    {
        from_node_position = wc_id_map[wcomponent.id]
        to_node_position = wc_id_map[wcomponent.judgement_target_wcomponent_id]
        from_connection_type = { direction: "from", attribute: "meta" }
        to_connection_type = { direction: "to", attribute: "meta" }
    }

    return { from_node_position, to_node_position, from_connection_type, to_connection_type }
}



function calculate_effect (wcomponent: WComponent, from_wc: WComponent | undefined, state: RootState)
{
    let connection_effect: number | undefined = undefined

    // TODO move all of this into a derived reducer
    if (wcomponent_is_causal_link(wcomponent))
    {
        if (wcomponent_is_statev2(from_wc))
        {
            const VAP_set = get_current_VAP_set({
                values_and_prediction_sets: from_wc.values_and_prediction_sets,
                created_at_ms: state.routing.args.created_at_ms,
                sim_ms: state.routing.args.sim_ms,
            })


            if (VAP_set)
            {
                const value_args = get_props_for_get_counterfactual_v2_VAP_set(from_wc, state)
                const counterfactual_VAP_set = get_counterfactual_v2_VAP_set({ ...value_args, VAP_set })
                const VAPs_represent = wcomponent_VAPs_represent(from_wc)
                const raw_data = get_VAP_visuals_data({
                    wcomponent: from_wc, VAP_set: counterfactual_VAP_set, VAPs_represent
                })
                const value = raw_data[0]?.value

                if (value !== undefined && value !== null)
                {
                    if (VAPs_represent === VAPsType.boolean)
                    {
                        connection_effect = value === true
                            ? wcomponent.effect_when_true
                            : wcomponent.effect_when_false
                    }
                    else
                    {
                        connection_effect = typeof value === "number"
                            ? (wcomponent.effect_when_true !== undefined ? value * wcomponent.effect_when_true : undefined)
                            : wcomponent.effect_when_true
                    }
                }
            }
        }
    }

    return connection_effect !== undefined ? bounded(connection_effect, -100, 100) : undefined
}
