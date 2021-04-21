import { WComponent, wcomponent_is_state } from "./SpecialisedObjects"



export function get_wcomponent_state_value (wcomponent: WComponent): string | null | undefined
{
    if (!wcomponent_is_state(wcomponent)) return undefined

    if (!wcomponent.values) return undefined // TODO remove once MVP reached

    const state_value_entry = wcomponent.values[wcomponent.values.length - 1]

    if (!state_value_entry) return undefined

    return state_value_entry.value
}
