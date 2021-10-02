import { h } from "preact"
import type { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"



interface OwnProps
{
    wcomponent_id: string
    VAPs_represent: VAPsType
    values_and_prediction_sets: StateValueAndPredictionsSet[]
    update_values_and_predictions: (values_and_predictions: StateValueAndPredictionsSet[]) => void
}


export function ValuesEditor (props: OwnProps)
{
    return <div></div>
}
