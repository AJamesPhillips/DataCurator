import { FunctionalComponent } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "./WComponentCanvasConnection.scss"
import { CanvasConnection } from "../../canvas/connections/CanvasConnection"
import { ConnectionEndType } from "../../canvas/connections/ConnectionEnd"
import { convert_VAP_set_to_VAP_visuals } from "../../wcomponent_derived/value_and_prediction/convert_VAP_set_to_VAP_visuals"
import { bounded } from "../../shared/utils/bounded"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import {
    WComponent,
    wcomponent_is_plain_connection,
    wcomponent_is_judgement_or_objective,
    wcomponent_can_render_connection,
    wcomponent_is_causal_link,
    wcomponent_is_statev2,
    ConnectionLineBehaviour,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import {
    apply_counterfactuals_v2_to_VAP_set,
} from "../../wcomponent_derived/value_and_prediction/apply_counterfactuals_v2_to_VAP_set"
import { get_current_VAP_set } from "../../wcomponent_derived/value_and_prediction/get_current_v2_VAP_set"
import { get_wcomponent_VAPs_represent } from "../../wcomponent/get_wcomponent_VAPs_represent"
import { ACTIONS } from "../../state/actions"
import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import {
    calc_connection_wcomponent_should_display,
    calc_judgement_connection_wcomponent_should_display,
    calc_display_opacity,
} from "../calc_should_display"
import { factory_on_click } from "../canvas_common"
import { get_VAP_set_id_to_counterfactual_v2_map } from "../../state/derived/accessor"
import { get_connection_termini } from "./connection_termini"



interface OwnProps
{
    id: string
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { id: wcomponent_id } = own_props
    const wcomponent = get_wcomponent_from_state(state, wcomponent_id)

    const { selected_wcomponent_ids_set } = state.meta_wcomponents
    const { current_composed_knowledge_view: composed_kv } = state.derived
    const { created_at_ms, sim_ms } = state.routing.args
    const { derived_validity_filter: validity_filter } = state.display_options
    const is_editing = !state.display_options.consumption_formatting

    let validity_value_result: false | { display_certainty: number } = false
    let from_wc: WComponent | undefined = undefined
    let to_wc: WComponent | undefined = undefined

    let connection_effect: number | undefined = undefined

    if (!wcomponent || !composed_kv) ""
    else
    {
        const { wc_ids_excluded_by_filters } = composed_kv.filters
        const kv_entry = composed_kv.composed_wc_id_map[wcomponent.id]

        if (wcomponent_is_plain_connection(wcomponent))
        {
            from_wc = get_wcomponent_from_state(state, wcomponent.from_id)
            to_wc = get_wcomponent_from_state(state, wcomponent.to_id)
            const from_wc__kv_entry = composed_kv.composed_wc_id_map[wcomponent.from_id]
            const to_wc__kv_entry = composed_kv.composed_wc_id_map[wcomponent.to_id]

            validity_value_result = calc_connection_wcomponent_should_display({
                wcomponent, kv_entry,
                validity_filter,
                from_wc, to_wc, from_wc__kv_entry, to_wc__kv_entry,
                created_at_ms, sim_ms,
                selected_wcomponent_ids_set, wc_ids_excluded_by_filters,
            })

            // TODO move all of this into a derived reducer
            connection_effect = calculate_effect(wcomponent, from_wc, state)
        }
        else if (wcomponent_is_judgement_or_objective(wcomponent))
        {
            const target_id = wcomponent.judgement_target_wcomponent_id
            const target_wc = get_wcomponent_from_state(state, target_id)
            const target_wc__kv_entry = composed_kv.composed_wc_id_map[target_id]

            validity_value_result = calc_judgement_connection_wcomponent_should_display({
                wcomponent, kv_entry,
                validity_filter,
                target_wc, target_wc__kv_entry,
                created_at_ms, sim_ms,
                selected_wcomponent_ids_set, wc_ids_excluded_by_filters,
            })
        }
    }


    const validity_value: false | number = validity_value_result === false ? false : validity_value_result.display_certainty
    const shift_or_control_keys_are_down = state.global_keys.derived.shift_or_control_down


    return {
        current_composed_knowledge_view: composed_kv,
        wcomponent,
        from_wc,
        to_wc,
        connection_effect,
        validity_value,
        is_current_item: state.routing.item_id === wcomponent_id,
        is_selected: state.meta_wcomponents.selected_wcomponent_ids_set.has(wcomponent_id),
        is_highlighted: state.meta_wcomponents.highlighted_wcomponent_ids.has(wcomponent_id),
        is_editing,
        certainty_formatting: state.display_options.derived_certainty_formatting,
        shift_or_control_keys_are_down,
        focused_mode: state.display_options.focused_mode,
        connected_neighbour_is_highlighted: state.meta_wcomponents.neighbour_ids_of_highlighted_wcomponent.has(wcomponent_id),
        circular_links: state.display_options.circular_links,
    }
}



const map_dispatch = {
    clicked_wcomponent: ACTIONS.meta_wcomponents.clicked_wcomponent,
    clear_selected_wcomponents: ACTIONS.meta_wcomponents.clear_selected_wcomponents,
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
    change_route: ACTIONS.routing.change_route,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCanvasConnection (props: Props)
{
    const {
        id, current_composed_knowledge_view, wcomponent,
        from_wc, to_wc,
        is_current_item, is_highlighted, is_selected,
        validity_value, connection_effect,
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

    if (validity_value === false) return null

    if (!current_composed_knowledge_view)
    {
        console.error(`Tried to render a WComponentCanvasConnection of world component id: "${id}" but no current_composed_knowledge_view`)
        return null
    }


    const on_click = factory_on_click({ wcomponent_id: id, clicked_wcomponent, clear_selected_wcomponents, shift_or_control_keys_are_down, change_route, is_current_item })


    const connection_termini = get_connection_termini({
        wcomponent,
        from_wc,
        to_wc,
        current_composed_knowledge_view,
    })

    const { connection_from_component, connection_to_component } = useMemo(
        () => connection_termini,
        [JSON.stringify(connection_termini)]
    )


    const validity_opacity = calc_display_opacity({
        is_editing: props.is_editing,
        certainty: validity_value,
        is_current_item,
        is_selected,
        connected_neighbour_is_highlighted: props.connected_neighbour_is_highlighted,
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

    let line_behaviour: ConnectionLineBehaviour | undefined = undefined
    if (wcomponent_is_plain_connection(wcomponent)) line_behaviour = wcomponent.line_behaviour

    return <CanvasConnection
        connection_from_component={connection_from_component}
        connection_to_component={connection_to_component}
        on_click={on_click}
        on_pointer_over_out={over => props.set_highlighted_wcomponent({ id, highlighted: over })}
        line_behaviour={line_behaviour}
        circular_links={props.circular_links}
        thickness={thickness}
        connection_end_type={connection_end_type}
        intensity={validity_opacity}
        is_highlighted={is_current_item || is_highlighted || is_selected}
        focused_mode={props.focused_mode}
        extra_css_classes={"connection_type_" + wcomponent.type + " " + effect}
    />
}

export const WComponentCanvasConnection = connector(_WComponentCanvasConnection) as FunctionalComponent<OwnProps>


function calculate_effect (wcomponent: WComponent, from_wc: WComponent | undefined, state: RootState)
{
    let connection_effect: number | undefined = undefined

    // TODO move all of this into a derived reducer
    if (wcomponent_is_causal_link(wcomponent))
    {
        // Default connection_effect to effect_when_true
        connection_effect = wcomponent.effect_when_true


        if (wcomponent_is_statev2(from_wc))
        {
            const VAP_set = get_current_VAP_set({
                values_and_prediction_sets: from_wc.values_and_prediction_sets,
                created_at_ms: state.routing.args.created_at_ms,
                sim_ms: state.routing.args.sim_ms,
            })


            if (VAP_set)
            {
                const VAP_set_id_to_counterfactual_v2_map = get_VAP_set_id_to_counterfactual_v2_map(state, from_wc.id)
                const counterfactual_VAP_set = apply_counterfactuals_v2_to_VAP_set({
                    VAP_set, VAP_set_id_to_counterfactual_v2_map,
                })

                // Using an empty wcomponents_by_id for now as making causal connections from state_value should not be
                // supported (for now) and I want to think more about this use case before implementing it
                const wcomponents_by_id = {}
                const VAPs_represent = get_wcomponent_VAPs_represent(from_wc, wcomponents_by_id)
                const visual_VAPs = convert_VAP_set_to_VAP_visuals({
                    wcomponent: from_wc, VAP_set: counterfactual_VAP_set, VAPs_represent
                })
                const value = visual_VAPs[0]?.parsed_value

                if (value !== undefined && value !== null)
                {
                    if (VAPs_represent === VAPsType.boolean)
                    {
                        connection_effect = value === true
                            ? wcomponent.effect_when_true
                            // Because we're thinking of deprecating the `effect_when_false` field
                            // and replacing it all with the `effect_string` logic powered
                            // by simulation.js (from InsightMaker) then we fallback
                            // to using effect_when_true if effect_when_false is undefined
                            : (wcomponent.effect_when_false ?? wcomponent.effect_when_true)
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
