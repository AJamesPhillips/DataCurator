import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_wcomponent_state_value } from "../shared/models/get_wcomponent_state_value"
import {
    WComponent,
    wcomponent_is_judgement,
    wcomponent_is_state,
} from "../shared/models/interfaces/SpecialisedObjects"
import type { UIStateValue } from "../shared/models/interfaces/state"
import type { RootState } from "../state/State"
import { calculate_judgement_value } from "./judgements/calculate_judgement_value"
import { JudgementBadge } from "./judgements/JudgementBadge"
import { DisplayValue } from "./multiple_values/DisplayValue"



interface OwnProps
{
    wcomponent: WComponent
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { created_at_ms, sim_ms } = state.routing.args
    const { wcomponent } = own_props


    let target_wcomponent: WComponent | undefined = undefined
    if (wcomponent_is_judgement(wcomponent))
    {
        const map = state.specialised_objects.wcomponents_by_id
        target_wcomponent = map[wcomponent.judgement_target_wcomponent_id]
    }


    return { created_at_ms, sim_ms, target_wcomponent }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentStatefulValue (props: Props)
{
    const { ui_value, judgement_value, is_judgement, is_empty } = process_props(props)

    const state_value_container_class_name = "node_state_value_container " + (is_empty ? "empty" : "")

    const value_to_render = is_judgement
        ? <JudgementBadge judgement={judgement_value} />
        : ui_value && <DisplayValue UI_value={ui_value} />

    return <div className={state_value_container_class_name}>{value_to_render}</div>
}

export const WComponentStatefulValue = connector(_WComponentStatefulValue) as FunctionalComponent<OwnProps>



function process_props (props: Props)
{
    let ui_value: UIStateValue | undefined = undefined
    let judgement_value = undefined
    let is_judgement = false
    let is_empty = true

    const { wcomponent, created_at_ms, sim_ms, target_wcomponent } = props


    if (wcomponent_is_state(wcomponent))
    {
        ui_value = get_wcomponent_state_value(wcomponent, created_at_ms, sim_ms)
        is_empty = ui_value.value === undefined
    }
    else if (wcomponent_is_judgement(wcomponent))
    {
        is_judgement = true
        is_empty = false

        judgement_value = calculate_judgement_value({ wcomponent, target_wcomponent, created_at_ms, sim_ms })
    }

    return { ui_value, judgement_value, is_judgement, is_empty }
}
