import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { WComponent, wcomponent_is_judgement_or_objective } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { WComponentCounterfactuals } from "../../shared/wcomponent/interfaces/uncertainty"
import { get_wcomponent_counterfactuals } from "../../state/derived/accessor"
import type { RootState } from "../../state/State"
import { calculate_judgement_value } from "./calculate_judgement_value"
import { JudgementBadge } from "./JudgementBadge"



interface OwnProps
{
    judgement_id: string
}



const map_state = (state: RootState, own_props: OwnProps) => {
    const wcomponent = state.specialised_objects.wcomponents_by_id[own_props.judgement_id]

    let target_wcomponent: WComponent | undefined = undefined
    let target_counterfactuals: WComponentCounterfactuals | undefined = undefined
    if (wcomponent && wcomponent_is_judgement_or_objective(wcomponent))
    {
        const target_id = wcomponent.judgement_target_wcomponent_id
        target_wcomponent = state.specialised_objects.wcomponents_by_id[target_id]
        target_counterfactuals = get_wcomponent_counterfactuals(state, target_id)
    }

    return {
        wcomponent,
        target_wcomponent,
        target_counterfactuals,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


// Refactor this file to hide JudgementBadge inside it
function _JudgementBadgeC (props: Props)
{
    const { judgement_id, wcomponent, target_wcomponent, target_counterfactuals, created_at_ms, sim_ms } = props

    if (!wcomponent || !target_wcomponent || !wcomponent_is_judgement_or_objective(wcomponent)) return null

    const judgement_value = calculate_judgement_value({ wcomponent, target_wcomponent, target_counterfactuals, created_at_ms, sim_ms })

    return <JudgementBadge judgement={judgement_value} judgement_id={judgement_id} />
}

export const JudgementBadgeC = connector(_JudgementBadgeC) as FunctionalComponent<OwnProps>
