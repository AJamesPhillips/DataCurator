import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { WComponent, wcomponent_is_judgement_or_objective } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { WComponentCounterfactuals } from "../../shared/uncertainty/uncertainty"
import { get_wcomponent_counterfactuals } from "../../state/derived/accessor"
import type { RootState } from "../../state/State"
import { calculate_judgement_value } from "./calculate_judgement_value"
import { JudgementBadge } from "./JudgementBadge"
import {
    get_current_UI_knowledge_view_from_state,
    get_wcomponent_from_state,
} from "../../state/specialised_objects/accessors"



interface OwnProps
{
    judgement_or_objective_id: string
}



const map_state = (state: RootState, own_props: OwnProps) => {
    let judgement_wcomponent = get_wcomponent_from_state(state, own_props.judgement_or_objective_id)
    if (!wcomponent_is_judgement_or_objective(judgement_wcomponent)) judgement_wcomponent = undefined


    let target_wcomponent: WComponent | undefined = undefined
    let target_counterfactuals: WComponentCounterfactuals | undefined = undefined
    if (judgement_wcomponent)
    {
        const target_id = judgement_wcomponent.judgement_target_wcomponent_id
        target_wcomponent = get_wcomponent_from_state(state, target_id)
        target_counterfactuals = get_wcomponent_counterfactuals(state, target_id)
    }

    const kv = get_current_UI_knowledge_view_from_state(state)
    const position = kv ? kv.derived_wc_id_map[own_props.judgement_or_objective_id] : undefined

    return {
        judgement_wcomponent,
        target_wcomponent,
        target_counterfactuals,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        position,
    }
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


// Refactor this file to rename this component
function _JudgementBadgeConnected (props: Props)
{
    const { judgement_or_objective_id: judgement_id, judgement_wcomponent, target_wcomponent, target_counterfactuals, created_at_ms, sim_ms, position } = props

    if (!judgement_wcomponent || !target_wcomponent) return null

    const judgement_value = calculate_judgement_value({ judgement_wcomponent: judgement_wcomponent, target_wcomponent, target_counterfactuals, created_at_ms, sim_ms })

    return <JudgementBadge judgement={judgement_value} judgement_or_objective_id={judgement_id} position={position} />
}

export const JudgementBadgeConnected = connector(_JudgementBadgeConnected) as FunctionalComponent<OwnProps>