import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_wcomponent_state_value } from "../shared/models/get_wcomponent_state_value"
import {
    WComponent,
    wcomponent_is_judgement,
    wcomponent_is_state,
} from "../shared/models/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { calculate_judgement_value } from "./judgements/calculate_judgement_value"
import { JudgementBadge } from "./judgements/JudgementBadge"



interface OwnProps
{
    wcomponent: WComponent
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { wcomponent } = own_props

    let value: string | null | undefined = undefined
    let judgement_value = undefined
    let is_judgement = false
    let is_empty = true

    const { created_at_ms, sim_ms } = state.routing.args

    if (wcomponent_is_state(wcomponent))
    {
        value = get_wcomponent_state_value(wcomponent, created_at_ms, sim_ms)
        is_empty = value === undefined
    }
    else if (wcomponent_is_judgement(wcomponent))
    {
        is_judgement = true
        is_empty = false

        const map = state.specialised_objects.wcomponents_by_id
        const target_wcomponent = map[wcomponent.judgement_target_wcomponent_id]
        judgement_value = calculate_judgement_value({ wcomponent, target_wcomponent, created_at_ms, sim_ms })
    }

    return { value, judgement_value, is_judgement, is_empty }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentStatefulValue (props: Props)
{
    const { value, judgement_value, is_judgement, is_empty } = props

    const state_value_container_class_name = "node_state_value_container " + (is_empty ? "empty" : "")

    const value_to_render = is_judgement ? <JudgementBadge judgement={judgement_value} /> : value

    return <div className={state_value_container_class_name}>{value_to_render}</div>
}

export const WComponentStatefulValue = connector(_WComponentStatefulValue) as FunctionalComponent<OwnProps>
