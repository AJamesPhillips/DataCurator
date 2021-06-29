import { FunctionalComponent, h } from "preact"

import "./ValueAndPredictionSetSummary.scss"
import { WComponent, wcomponent_has_VAP_sets } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ValueAndPredictionSetSummary } from "./ValueAndPredictionSetSummary"
import { get_current_counterfactual_v2_VAP_sets } from "../../shared/wcomponent/value_and_prediction/get_value_v2"
import { wcomponent_VAPs_represent } from "../../shared/wcomponent/value_and_prediction/utils"
import type { RootState } from "../../state/State"
import { connect, ConnectedProps } from "react-redux"
import { get_wcomponent_counterfactuals } from "../../state/derived/accessor"



interface OwnProps
{
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { wcomponent } = own_props

    const wc_counterfactuals = get_wcomponent_counterfactuals(state, wcomponent.id)

    return { wc_counterfactuals }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _NodeValueAndPredictionSetSummary (props: Props)
{
    if (!wcomponent_has_VAP_sets(props.wcomponent)) return null

    const VAPs_represent = wcomponent_VAPs_represent(props.wcomponent)

    const VAP_set = get_current_counterfactual_v2_VAP_sets({
        ...props,
        values_and_prediction_sets: props.wcomponent.values_and_prediction_sets,
        VAPs_represent,
    })

    if (!VAP_set) return null

    return <ValueAndPredictionSetSummary VAP_set={VAP_set} />
}

export const NodeValueAndPredictionSetSummary = connector(_NodeValueAndPredictionSetSummary) as FunctionalComponent<OwnProps>
