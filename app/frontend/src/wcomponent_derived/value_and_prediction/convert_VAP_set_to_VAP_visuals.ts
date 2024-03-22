import { SortDirection, sort_list } from "../../shared/utils/sort"
import type { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet as VAPSet } from "../../wcomponent/interfaces/state"
import type { VAPVisual } from "../interfaces/value"
import { get_boolean_representation, parsed_value_to_string } from "../value/parsed_value_presentation"
import {
    add_uncertain_VAP_visual,
    ensure_VAP_set_entries_consistent_with_representing_type,
} from "./utils_to_convert_VAP_set_to_visuals"
import { get_parsed_value_represented_by_a_VAP } from "../../wcomponent/value/parse_value"



interface ConvertVAPSetToVAPVisualsDataArgs
{
    VAP_set: VAPSet
    VAPs_represent: VAPsType
    wcomponent: WComponent
}
export function convert_VAP_set_to_VAP_visuals (args: ConvertVAPSetToVAPVisualsDataArgs): VAPVisual[]
{
    const cleaned_VAP_set = ensure_VAP_set_entries_consistent_with_representing_type(args.VAP_set, args.VAPs_represent)

    const shared_conviction = cleaned_VAP_set.shared_entry_values?.conviction
    let total_certainties = 0


    const boolean_representation = get_boolean_representation(args.wcomponent)
    const data: VAPVisual[] = cleaned_VAP_set.entries.map(VAP =>
    {
        const parsed_value = get_parsed_value_represented_by_a_VAP(VAP, args.VAPs_represent)
        const value_text = parsed_value_to_string(parsed_value, boolean_representation)
        const conviction = shared_conviction ?? VAP.conviction
        const certainty = VAP.probability * conviction
        total_certainties += certainty

        return {
            VAP_id: VAP.id,
            value_id: VAP.value_id,
            parsed_value,
            value_text,
            certainty,
        }
    })


    // TODO protect against unstable sort when percentage_height is the same
    const sorted_data = sort_list(data, i => i.certainty, SortDirection.descending)

    // Will add entry for uncertain value last
    return add_uncertain_VAP_visual(total_certainties, sorted_data)
}
