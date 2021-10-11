import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { wcomponent_is_judgement_or_objective } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../../state/State"
import { core_calculate_judgement_value } from "./calculate_judgement_value"
import { JudgementBadge } from "./JudgementBadge"
import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponent_from_state,
} from "../../state/specialised_objects/accessors"
import type { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import type { ParsedValue } from "../../wcomponent_derived/interfaces/value"



interface OwnProps
{
    judgement_or_objective_id: string
    target_VAPs_represent: VAPsType
    value: ParsedValue
}



const map_state = (state: RootState, own_props: OwnProps) => {
    let judgement_wcomponent = get_wcomponent_from_state(state, own_props.judgement_or_objective_id)
    if (!wcomponent_is_judgement_or_objective(judgement_wcomponent)) judgement_wcomponent = undefined


    const kv = get_current_composed_knowledge_view_from_state(state)
    const position = kv ? kv.composed_wc_id_map[own_props.judgement_or_objective_id] : undefined


    return {
        judgement_wcomponent,
        position,
    }
}



const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _JudgementBadgeSimple (props: Props)
{
    const { judgement_or_objective_id: judgement_id, judgement_wcomponent, position, target_VAPs_represent, value } = props

    if (!judgement_wcomponent) return null


    const judgement_value = core_calculate_judgement_value({ judgement_wcomponent, target_VAPs_represent, value })

    return <JudgementBadge
        judgement={judgement_value}
        judgement_or_objective_id={judgement_id}
        position={position}
    />
}

export const JudgementBadgeSimple = connector(_JudgementBadgeSimple) as FunctionalComponent<OwnProps>
