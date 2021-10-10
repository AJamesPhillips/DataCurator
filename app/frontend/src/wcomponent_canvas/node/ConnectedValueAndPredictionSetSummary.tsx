import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import {
    get_VAP_id_to_counterfactuals_info_map,
} from "../../wcomponent/counterfactuals/get_VAP_id_to_counterfactuals_info_map"

import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import {
    get_counterfactual_v2_VAP_set,
} from "../../wcomponent/value_and_prediction/get_counterfactual_v2_VAP_set"
import {
    get_partial_args_for_get_counterfactual_v2_VAP_set,
} from "../../state/specialised_objects/counterfactuals/get_props_for_state_v2"
import type { RootState } from "../../state/State"
import { ValueAndPredictionSetSummary } from "./ValueAndPredictionSetSummary"



interface OwnProps
{
    wcomponent: WComponent
    VAP_set: StateValueAndPredictionsSet
}



const map_state = (state: RootState, own_props: OwnProps) =>
{
    return {
        ...get_partial_args_for_get_counterfactual_v2_VAP_set(own_props.wcomponent.id, state),
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _ConnectedValueAndPredictionSetSummary (props: Props)
{
    const counterfactual_VAP_set = get_counterfactual_v2_VAP_set(props)
    const VAP_id_to_counterfactuals_info_map = get_VAP_id_to_counterfactuals_info_map(props)

    return <ValueAndPredictionSetSummary
        wcomponent={props.wcomponent}
        counterfactual_VAP_set={counterfactual_VAP_set}
        VAP_id_to_counterfactuals_info_map={VAP_id_to_counterfactuals_info_map}
    />
}

export const ConnectedValueAndPredictionSetSummary = connector(_ConnectedValueAndPredictionSetSummary) as FunctionalComponent<OwnProps>
