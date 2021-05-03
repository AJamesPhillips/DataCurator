import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { WComponent, wcomponent_is_judgement } from "../../shared/models/interfaces/SpecialisedObjects"
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
    if (wcomponent && wcomponent_is_judgement(wcomponent))
    {
        target_wcomponent = state.specialised_objects.wcomponents_by_id[wcomponent.judgement_target_wcomponent_id]
    }

    return {
        wcomponent,
        target_wcomponent,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _JudgementBadgeC (props: Props)
{
    const { wcomponent, target_wcomponent, created_at_ms, sim_ms } = props

    if (!wcomponent || !target_wcomponent || !wcomponent_is_judgement(wcomponent)) return null

    const judgement_value = calculate_judgement_value({ wcomponent, target_wcomponent, created_at_ms, sim_ms })

    return <JudgementBadge judgement={judgement_value} />
}

export const JudgementBadgeC = connector(_JudgementBadgeC) as FunctionalComponent<OwnProps>
