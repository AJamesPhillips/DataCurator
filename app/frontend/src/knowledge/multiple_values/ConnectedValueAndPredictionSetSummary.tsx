import { FunctionalComponent, h } from "preact"

import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../../state/State"
import { ValueAndPredictionSetSummary } from "./ValueAndPredictionSetSummary"
import { get_counterfactual_v2_VAP_set } from "../../shared/wcomponent/value_and_prediction/get_value_v2"
import {
    get_props_for_get_counterfactual_v2_VAP_set,
} from "../../state/specialised_objects/counterfactuals/get_props_for_state_v2"



interface OwnProps
{
    wcomponent: WComponent
    VAP_set: StateValueAndPredictionsSet
    flexBasis?: number
}



const map_state = (state: RootState, own_props: OwnProps) =>
{
    return get_props_for_get_counterfactual_v2_VAP_set(own_props.wcomponent, state)
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _ConnectedValueAndPredictionSetSummary (props: Props)
{
    const counterfactual_VAP_set = get_counterfactual_v2_VAP_set(props)

    return <ValueAndPredictionSetSummary
        wcomponent={props.wcomponent}
        counterfactual_VAP_set={counterfactual_VAP_set}
        flexBasis={props.flexBasis}
    />
}

export const ConnectedValueAndPredictionSetSummary = connector(_ConnectedValueAndPredictionSetSummary) as FunctionalComponent<OwnProps>
