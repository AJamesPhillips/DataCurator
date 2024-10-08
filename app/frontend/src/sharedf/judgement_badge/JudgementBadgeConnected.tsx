import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import {
    WComponent,
    wcomponent_is_judgement_or_objective,
} from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_VAP_set_id_to_counterfactual_v2_map } from "../../state/derived/accessor"
import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponent_from_state,
} from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { calculate_judgement_value } from "./calculate_judgement_value"
import { JudgementBadge } from "./JudgementBadge"
import type { VAPSetIdToCounterfactualV2Map } from "../../wcomponent_derived/interfaces/counterfactual"



interface OwnProps
{
    judgement_or_objective_id: string
    hide_judgement_trend: boolean
}



const map_state = (state: RootState, own_props: OwnProps) => {
    let judgement_wcomponent = get_wcomponent_from_state(state, own_props.judgement_or_objective_id)
    if (!wcomponent_is_judgement_or_objective(judgement_wcomponent)) judgement_wcomponent = undefined


    let target_wcomponent: WComponent | undefined = undefined
    let VAP_set_id_to_counterfactual_v2_map: VAPSetIdToCounterfactualV2Map | undefined = undefined
    if (judgement_wcomponent)
    {
        const target_id = judgement_wcomponent.judgement_target_wcomponent_id
        target_wcomponent = get_wcomponent_from_state(state, target_id)
        VAP_set_id_to_counterfactual_v2_map = get_VAP_set_id_to_counterfactual_v2_map(state, target_id)
    }

    const composed_kv = get_current_composed_knowledge_view_from_state(state)
    const position = composed_kv?.composed_wc_id_map[own_props.judgement_or_objective_id]

    return {
        judgement_wcomponent,
        target_wcomponent,
        VAP_set_id_to_counterfactual_v2_map,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        position,
    }
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _JudgementBadgeConnected (props: Props)
{
    const { judgement_or_objective_id, judgement_wcomponent, target_wcomponent, VAP_set_id_to_counterfactual_v2_map, created_at_ms, sim_ms, position } = props

    if (!judgement_wcomponent || !target_wcomponent) return null

    const judgement_value = calculate_judgement_value({ judgement_wcomponent, target_wcomponent, VAP_set_id_to_counterfactual_v2_map, created_at_ms, sim_ms })

    return <JudgementBadge
        judgement={judgement_value}
        judgement_trend_manual={props.hide_judgement_trend ? undefined : judgement_wcomponent.judgement_trend_manual}
        judgement_or_objective_id={judgement_or_objective_id}
        position={position}
        size={props.hide_judgement_trend ? "small" : "medium"}
    />
}

export const JudgementBadgeConnected = connector(_JudgementBadgeConnected) as FunctionalComponent<OwnProps>
