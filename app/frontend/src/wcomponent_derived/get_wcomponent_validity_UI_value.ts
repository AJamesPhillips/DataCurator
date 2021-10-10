import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_validity_value } from "./get_wcomponent_validity_value"
import type { DerivedValueForUI } from "./interfaces"



interface GetWcomponentValidityUIValueArgs
{
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
}
export function get_wcomponent_validity_UI_value (props: GetWcomponentValidityUIValueArgs): DerivedValueForUI
{
    const { wcomponent, created_at_ms, sim_ms } = props

    const { is_defined, value, uncertain, probability, conviction } = get_wcomponent_validity_value({ wcomponent, created_at_ms, sim_ms })

    const value_str = value ? "Valid" : "Invalid"

    return { is_defined, values_string: value_str, probabilities_string: "", convictions_string: "" }
}
