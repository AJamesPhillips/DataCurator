import { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { double_at_mentioned_uuids_regex } from "../sharedf/rich_text/id_regexs"
import { WComponentNodeStateV2 } from "../wcomponent/interfaces/state"



export function apply_units_from_component (calculation_string: string, units: string | undefined, wcomponents_by_id: WComponentsById)
{
    calculation_string = calculation_string.trim()
    const uuid_match = calculation_string.match(double_at_mentioned_uuids_regex)

    // If `uuid_match[0] !== calculation_string` it means there's something else in
    // the calculation string, perhaps a "+ 1" or another @@uuid, in which case
    // we don't currently automatically set the units
    if (uuid_match && uuid_match[0] === calculation_string)
    {
        const uuid = uuid_match[0].slice(2) // slice removes initial @@
        const component = wcomponents_by_id[uuid] as WComponentNodeStateV2
        units = component?.units// || units
    }

    return units
}
