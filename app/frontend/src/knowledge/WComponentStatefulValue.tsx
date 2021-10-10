import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_wcomponent_state_UI_value } from "../wcomponent/get_wcomponent_state_UI_value"
import type { VAPSetIdToCounterfactualV2Map } from "../wcomponent/interfaces/counterfactual"
import type { UIValue } from "../wcomponent/interfaces/value_probabilities_etc"
import {
    WComponent,
    wcomponent_is_judgement_or_objective,
    wcomponent_should_have_state_VAP_sets,
} from "../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_counterfactuals_v2 } from "../state/derived/accessor"
import { get_wcomponent_from_state } from "../state/specialised_objects/accessors"
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

    let wc_counterfactuals: VAPSetIdToCounterfactualV2Map | undefined
    let target_wcomponent: WComponent | undefined = undefined
    if (wcomponent_is_judgement_or_objective(wcomponent))
    {
        const target_id = wcomponent.judgement_target_wcomponent_id
        target_wcomponent = get_wcomponent_from_state(state, target_id)
        wc_counterfactuals = get_wcomponent_counterfactuals_v2(state, target_id)
    }
    else
    {
        wc_counterfactuals = get_wcomponent_counterfactuals_v2(state, wcomponent.id)
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


    if (wcomponent_should_have_state_VAP_sets(wcomponent))
    {
        ui_value = get_wcomponent_state_UI_value({ wcomponent, wc_counterfactuals, created_at_ms, sim_ms })
    }
    else if (wcomponent_is_judgement_or_objective(wcomponent))
    {
        is_judgement = true

        judgement_value = calculate_judgement_value({ judgement_wcomponent: wcomponent, target_wcomponent, target_counterfactuals: wc_counterfactuals, created_at_ms, sim_ms })
    }
    else
    {
        is_empty = true
    }

    return { ui_value, judgement_value, is_judgement, is_empty }
}
