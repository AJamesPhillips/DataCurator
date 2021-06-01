import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_wcomponent_state_UI_value } from "../shared/wcomponent/get_wcomponent_state_UI_value"
import type { UIValue } from "../shared/wcomponent/interfaces/generic_value"
import {
    WComponent,
    wcomponent_is_judgement_or_objective,
    wcomponent_should_have_state,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import type { WComponentCounterfactuals } from "../shared/uncertainty/uncertainty"
import { get_wcomponent_counterfactuals } from "../state/derived/accessor"
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

    let wc_counterfactuals: WComponentCounterfactuals | undefined
    let target_wcomponent: WComponent | undefined = undefined
    if (wcomponent_is_judgement_or_objective(wcomponent))
    {
        const target_id = wcomponent.judgement_target_wcomponent_id
        target_wcomponent = state.specialised_objects.wcomponents_by_id[target_id]
        wc_counterfactuals = get_wcomponent_counterfactuals(state, target_id)
    }
    else
    {
        wc_counterfactuals = get_wcomponent_counterfactuals(state, wcomponent.id)
    }


    return { wc_counterfactuals, created_at_ms, sim_ms, target_wcomponent }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentStatefulValue (props: Props)
{
    const { ui_value, judgement_value, is_judgement, is_empty } = process_props(props)

    const value_to_render = is_judgement
        // Refactor this to use JudgementBadgeC
        ? <JudgementBadge judgement={judgement_value} />
        : ui_value && <DisplayValue UI_value={ui_value} />

    return <div
        className="node_state_value"
        style={{ display: is_empty ? "none" : "" }}
    >
        {value_to_render}
    </div>
}

export const WComponentStatefulValue = connector(_WComponentStatefulValue) as FunctionalComponent<OwnProps>



function process_props (props: Props)
{
    let ui_value: UIValue | undefined = undefined
    let judgement_value = undefined
    let is_judgement = false
    let is_empty = false

    const { wcomponent, wc_counterfactuals, created_at_ms, sim_ms, target_wcomponent } = props


    if (wcomponent_should_have_state(wcomponent))
    {
        ui_value = get_wcomponent_state_UI_value({ wcomponent, wc_counterfactuals, created_at_ms, sim_ms })
    }
    else if (wcomponent_is_judgement_or_objective(wcomponent))
    {
        is_judgement = true

        judgement_value = calculate_judgement_value({ wcomponent, target_wcomponent, target_counterfactuals: wc_counterfactuals, created_at_ms, sim_ms })
    }
    else
    {
        is_empty = true
    }

    return { ui_value, judgement_value, is_judgement, is_empty }
}
