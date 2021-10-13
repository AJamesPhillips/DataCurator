import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { wcomponent_should_have_state_VAP_sets } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentSubState } from "../../wcomponent/interfaces/substate"
import type { RootState } from "../../state/State"
import { ConnectedValueAndPredictionSetSummary } from "./ConnectedValueAndPredictionSetSummary"
import { NodeValueAndPredictionSetSummary } from "./NodeValueAndPredictionSetSummary"

import { get_VAP_id_to_counterfactuals_info_map } from "../../wcomponent_derived/counterfactuals/get_VAP_id_to_counterfactuals_info_map"
import { apply_counterfactuals_v2_to_VAP_set } from "../../wcomponent_derived/value_and_prediction/apply_counterfactuals_v2_to_VAP_set"
import { get_VAP_set_id_to_counterfactual_v2_map } from "../../state/derived/accessor"
import { convert_VAP_set_to_VAP_visuals } from "../../wcomponent_derived/value_and_prediction/convert_VAP_set_to_VAP_visuals"
import { get_wcomponent_VAPs_represent } from "../../wcomponent/get_wcomponent_VAPs_represent"
import { predicate_target_value_possibility } from "../../wcomponent_derived/sub_state/convert_VAP_sets_to_visual_sub_state_value_possibilities"
import type { VAPVisual } from "../../wcomponent_derived/interfaces/value"
import type { CounterfactualV2StateValueAndPredictionSetInfo } from "../../wcomponent/interfaces/counterfactual"
import { ValueAndPredictionEntryRow } from "./ValueAndPredictionEntryRow"
import { value_possibility_for_UI } from "../../wcomponent/value/parse_value"
import { percentage_to_string } from "../../sharedf/percentages"



interface OwnProps
{
    wcomponent: WComponentSubState
    created_at_ms: number
    sim_ms: number
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { target_wcomponent_id } = own_props.wcomponent
    const maybe_target_wcomponent = state.specialised_objects.wcomponents_by_id[target_wcomponent_id || ""]
    const target_wcomponent = wcomponent_should_have_state_VAP_sets(maybe_target_wcomponent) && maybe_target_wcomponent
    const VAP_set_id_to_counterfactual_v2_map = get_VAP_set_id_to_counterfactual_v2_map(state, target_wcomponent_id)

    return {
        target_wcomponent,
        VAP_set_id_to_counterfactual_v2_map,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _NodeSubStateSummary (props: Props)
{
    const { target_wcomponent, VAP_set_id_to_counterfactual_v2_map, knowledge_views_by_id } = props
    if (!target_wcomponent) return null

    const { selector } = props.wcomponent
    const { target_VAP_set_id, target_value_id_type, target_value } = selector || {}
    const have_target_value = target_value_id_type !== undefined && target_value !== undefined

    let target_VAP_sets = target_wcomponent.values_and_prediction_sets || []
    const VAPs_represent = get_wcomponent_VAPs_represent(target_wcomponent)

    if (target_VAP_set_id === undefined)
    {
        if (!have_target_value)
        {
            return <NodeValueAndPredictionSetSummary
                wcomponent={target_wcomponent}
                created_at_ms={props.created_at_ms}
                sim_ms={props.sim_ms}
            />
        }
        else
        {
            let value_text = target_value
            let value_id = ""
            if (target_value_id_type === "id")
            {
                value_id = target_value
                value_text = ((target_wcomponent.value_possibilities || {})[target_value])?.value || target_value
            }
            const parsed_value = value_possibility_for_UI({ value: value_text, id: value_id }, VAPs_represent)

            const VAP_visual: VAPVisual = {
                VAP_id: "",
                parsed_value,
                value_text,
                certainty: 1,
            }

            const counterfactual_VAP_set_info: CounterfactualV2StateValueAndPredictionSetInfo = {
                has_any_counterfactual_applied: false,
                active_counterfactual_v2_id: undefined,
            }

            return <ValueAndPredictionEntryRow
                wcomponent={props.wcomponent}
                VAP_visual={VAP_visual}
                show_judgements={true}
                counterfactual_VAP_set={counterfactual_VAP_set_info}
                VAP_id_to_counterfactuals_info_map={{}}
            />
        }
    }

    target_VAP_sets = target_VAP_sets.filter(({ id }) => id === target_VAP_set_id)
    const target_VAP_set = target_VAP_sets[0]
    if (!target_VAP_set) return <div>Invalid configuration</div>

    if (!have_target_value)
    {
        return <ConnectedValueAndPredictionSetSummary
            wcomponent={target_wcomponent}
            VAP_set={target_VAP_set}
        />
    }


    const counterfactual_VAP_set = apply_counterfactuals_v2_to_VAP_set({
        VAP_set: target_VAP_set,
        VAP_set_id_to_counterfactual_v2_map,
    })
    const VAP_id_to_counterfactuals_info_map = get_VAP_id_to_counterfactuals_info_map({
        VAP_set: target_VAP_set,
        VAP_set_id_to_counterfactual_v2_map,
        knowledge_views_by_id,
    })

    const VAP_visuals_data = convert_VAP_set_to_VAP_visuals({ ...props, VAP_set: counterfactual_VAP_set, VAPs_represent })
    let VAP_visual = VAP_visuals_data.find(({ value_id, value_text }) => predicate_target_value_possibility({
        target_value_id_type, target_value, value_id, value_text,
    }))
    if (!VAP_visual) return <div>Invalid configuration</div>

    const value_text = VAP_visual.value_text + ` ${percentage_to_string(VAP_visual.certainty * 100)}%`
    VAP_visual = {...VAP_visual, value_text, certainty: 1}

    return <ValueAndPredictionEntryRow
        wcomponent={props.wcomponent}
        VAP_visual={VAP_visual}
        show_judgements={true}
        counterfactual_VAP_set={counterfactual_VAP_set}
        VAP_id_to_counterfactuals_info_map={VAP_id_to_counterfactuals_info_map}
    />
}

export const NodeSubStateSummary = connector(_NodeSubStateSummary) as FunctionalComponent<OwnProps>
