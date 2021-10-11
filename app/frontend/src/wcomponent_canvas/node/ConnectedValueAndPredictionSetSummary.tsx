import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_VAP_set_id_to_counterfactual_v2_map } from "../../state/derived/accessor"
import type { RootState } from "../../state/State"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import {
    get_VAP_id_to_counterfactuals_info_map,
} from "../../wcomponent_derived/counterfactuals/get_VAP_id_to_counterfactuals_info_map"
import {
    apply_counterfactuals_v2_to_VAP_set,
} from "../../wcomponent_derived/value_and_prediction/apply_counterfactuals_v2_to_VAP_set"
import { ValueAndPredictionSetSummary } from "./ValueAndPredictionSetSummary"





interface OwnProps
{
    wcomponent: WComponent
    VAP_set: StateValueAndPredictionsSet
}



const map_state = (state: RootState, own_props: OwnProps) =>
{
    const VAP_set_id_to_counterfactual_v2_map = get_VAP_set_id_to_counterfactual_v2_map(state, own_props.wcomponent.id)
    return {
        VAP_set_id_to_counterfactual_v2_map,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _ConnectedValueAndPredictionSetSummary (props: Props)
{
    const { wcomponent, VAP_set, VAP_set_id_to_counterfactual_v2_map, knowledge_views_by_id } = props

    const counterfactual_VAP_set = apply_counterfactuals_v2_to_VAP_set({
        VAP_set,
        VAP_set_id_to_counterfactual_v2_map,
    })
    const VAP_id_to_counterfactuals_info_map = get_VAP_id_to_counterfactuals_info_map({
        VAP_set,
        VAP_set_id_to_counterfactual_v2_map,
        knowledge_views_by_id,
    })

    return <ValueAndPredictionSetSummary
        wcomponent={wcomponent}
        counterfactual_VAP_set={counterfactual_VAP_set}
        VAP_id_to_counterfactuals_info_map={VAP_id_to_counterfactuals_info_map}
    />
}

export const ConnectedValueAndPredictionSetSummary = connector(_ConnectedValueAndPredictionSetSummary) as FunctionalComponent<OwnProps>
