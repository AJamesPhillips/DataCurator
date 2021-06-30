import { FunctionalComponent, h } from "preact"

import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { connect, ConnectedProps } from "react-redux"
import type { VAP_set_id_counterfactual_mapV2 } from "../../shared/uncertainty/uncertainty"
import { get_current_composed_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { ValueAndPredictionSetSummary } from "./ValueAndPredictionSetSummary"
import { get_counterfactual_v2_VAP_set } from "../../shared/wcomponent/value_and_prediction/get_value_v2"



interface OwnProps
{
    wcomponent: WComponent
    VAP_set: StateValueAndPredictionsSet
    flexBasis?: number
}



const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { wcomponent } = own_props

    const current_composed_kv = get_current_composed_knowledge_view_from_state(state)

    let VAP_set_counterfactuals_map: VAP_set_id_counterfactual_mapV2 | undefined = undefined
    let active_counterfactual_v2_ids: string[] | undefined = undefined
    if (current_composed_kv)
    {
        active_counterfactual_v2_ids = current_composed_kv.active_counterfactual_v2_ids

        const cf = current_composed_kv.wc_id_counterfactuals_v2_map[wcomponent.id]
        VAP_set_counterfactuals_map = cf && cf.VAP_set
    }

    return {
        VAP_set_counterfactuals_map,
        active_counterfactual_v2_ids,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    }
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
