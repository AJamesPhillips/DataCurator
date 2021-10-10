import { h } from "preact"

import { WComponent, wcomponent_has_VAP_sets } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { get_current_VAP_set } from "../../../wcomponent/value_and_prediction/get_current_v2_VAP_set"
import { ConnectedValueAndPredictionSetSummary } from "./ConnectedValueAndPredictionSetSummary"



interface OwnProps
{
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
}


export function NodeValueAndPredictionSetSummary (props: OwnProps)
{
    if (!wcomponent_has_VAP_sets(props.wcomponent)) return null

    const VAP_set = get_current_VAP_set({
        ...props,
        values_and_prediction_sets: props.wcomponent.values_and_prediction_sets,
    })


    if (!VAP_set) return null

    return <ConnectedValueAndPredictionSetSummary
        wcomponent={props.wcomponent}
        VAP_set={VAP_set}
    />
}
