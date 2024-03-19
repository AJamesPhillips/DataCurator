import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import { default_wcomponent_validity_value, get_wcomponent_validity_value } from "./get_wcomponent_validity_value"
import type { DerivedValueForUI } from "./interfaces/value"



interface GetWcomponentValidityUIValueArgs
{
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_validity_UI_value (props: GetWcomponentValidityUIValueArgs): DerivedValueForUI
{
    const { wcomponent, created_at_ms, sim_ms } = props

    const { is_valid } = get_wcomponent_validity_value({ wcomponent, created_at_ms, sim_ms }) || default_wcomponent_validity_value()

    const values_string = is_valid ? "Valid" : "Invalid"

    return {
        values_string,
        counterfactual_applied: undefined,
        uncertain: undefined,
        derived__using_values_from_wcomponent_ids: undefined,
    }
}
