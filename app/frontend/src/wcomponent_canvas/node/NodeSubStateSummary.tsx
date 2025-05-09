import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../state/State"
import { wcomponent_is_allowed_to_have_state_VAP_sets } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentSubState } from "../../wcomponent/interfaces/substate"
import { ConnectedValueAndPredictionSetSummary } from "./ConnectedValueAndPredictionSetSummary"
import { NodeValueAndPredictionSetSummary } from "./NodeValueAndPredictionSetSummary"

import { get_VAP_set_id_to_counterfactual_v2_map } from "../../state/derived/accessor"
import { get_wcomponent_VAPs_represent } from "../../wcomponent/get_wcomponent_VAPs_represent"
import { get_VAP_id_to_counterfactuals_info_map } from "../../wcomponent_derived/counterfactuals/get_VAP_id_to_counterfactuals_info_map"
import { predicate_target_value_possibility } from "../../wcomponent_derived/sub_state/convert_VAP_sets_to_visual_sub_state_value_possibilities"
import { apply_counterfactuals_v2_to_VAP_set } from "../../wcomponent_derived/value_and_prediction/apply_counterfactuals_v2_to_VAP_set"
import { convert_VAP_set_to_VAP_visuals } from "../../wcomponent_derived/value_and_prediction/convert_VAP_set_to_VAP_visuals"
import { ValueAndPredictionEntryRow } from "./ValueAndPredictionEntryRow"
// import { value_possibility_for_UI } from "../../wcomponent/value/parse_value"
import { ratio_to_percentage_string } from "../../sharedf/percentages"
import { prune_items_by_created_at_and_versions } from "../../wcomponent_derived/value_and_prediction/partition_and_prune_items_by_datetimes_and_versions"



interface OwnProps
{
    wcomponent: WComponentSubState
    created_at_ms: number
    sim_ms: number
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { target_wcomponent_id } = own_props.wcomponent
    const { wcomponents_by_id } = state.specialised_objects
    const maybe_target_wcomponent = wcomponents_by_id[target_wcomponent_id || ""]
    const target_wcomponent = wcomponent_is_allowed_to_have_state_VAP_sets(maybe_target_wcomponent) && maybe_target_wcomponent
    const VAP_set_id_to_counterfactual_v2_map = get_VAP_set_id_to_counterfactual_v2_map(state, target_wcomponent_id)

    return {
        target_wcomponent,
        wcomponents_by_id,
        VAP_set_id_to_counterfactual_v2_map,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _NodeSubStateSummary (props: Props)
{
    const {
        target_wcomponent,
        wcomponents_by_id,
        VAP_set_id_to_counterfactual_v2_map,
        knowledge_views_by_id,
    } = props
    if (!target_wcomponent) return null

    const { selector } = props.wcomponent
    const { target_VAP_set_id, target_value_id_type, target_value } = selector || {}
    const have_target_value = target_value_id_type !== undefined && target_value !== undefined

    let target_VAP_sets = target_wcomponent.values_and_prediction_sets || []
    const VAPs_represent = get_wcomponent_VAPs_represent(target_wcomponent, wcomponents_by_id)

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
        // type guard
        else if (target_value_id_type === undefined || target_value === undefined) return null
        else
        {
            return null

            /*
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
            */
        }
    }

    target_VAP_sets = target_VAP_sets.filter(({ id }) => id === target_VAP_set_id)
    target_VAP_sets = prune_items_by_created_at_and_versions(target_VAP_sets, props.created_at_ms)
    const target_VAP_set = target_VAP_sets[0]
    if (!target_VAP_set) return <div>Invalid configuration</div>

    if (!have_target_value)
    {
        // Counterfactuals are still applied but happens inside / by this component
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

    let { value_text } = VAP_visual
    // // If not 100% certain then show probability
    // value_text += VAP_visual.certainty === 1 ? "" : ` ${ratio_to_percentage_string(VAP_visual.certainty)}%`
    // do not show the value text as if the title is not set then it will be show as the default title
    value_text = ` ${ratio_to_percentage_string(VAP_visual.certainty)}%`

    VAP_visual = { ...VAP_visual, value_text, certainty: 1 }

    return <ValueAndPredictionEntryRow
        wcomponent={target_wcomponent}
        VAP_visual={VAP_visual}
        show_judgements={true}
        counterfactual_VAP_set={counterfactual_VAP_set}
        VAP_id_to_counterfactuals_info_map={VAP_id_to_counterfactuals_info_map}
    />
}

export const NodeSubStateSummary = connector(_NodeSubStateSummary) as FunctionalComponent<OwnProps>
