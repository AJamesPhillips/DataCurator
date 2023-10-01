import { h } from "preact"

import type { DerivedValueForUI } from "../interfaces/value"
import "./DisplayValue.css"



interface OwnProps
{
    UI_value: DerivedValueForUI
}

export function DisplayValue (props: OwnProps)
{
    const { UI_value } = props
    const { values_string, counterfactual_applied, uncertain, derived__using_value_from_wcomponent_id } = UI_value
    const assumption_or_other_forced_value = counterfactual_applied || !!derived__using_value_from_wcomponent_id

    // TODO we need to re-work the colouring of this now because before the
    // counterfactuals that showed up as assumption and cause the value to show as orange
    // never had uncertainty, but now with state_value being included in this then it can be
    // uncertain as well as `assumption_or_other_forced_value` being true.
    const class_name = `value ${assumption_or_other_forced_value ? "assumption" : ""} ${uncertain ? "uncertain" : ""}`

    return <span className={class_name}>{values_string}</span>
}
