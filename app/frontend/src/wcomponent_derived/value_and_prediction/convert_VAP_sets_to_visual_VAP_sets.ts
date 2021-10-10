import { sort_list } from "../../shared/utils/sort"
import { get_boolean_representation, VAP_value_to_string } from "../get_wcomponent_state_UI_value"
import { VAPsType, ParsedValue } from "../../wcomponent/interfaces/value_probabilities_etc"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet } from "../../wcomponent/interfaces/state"
import { clean_VAP_set_entries, parse_VAP_value } from "./get_value"



const VAP_visual_uncertainty_id = "uncertainty_id__undefined__"
const VAP_visual_false_id = "false_id__undefined__"



interface GetVAPVisualsDataArgs
{
    VAP_set: StateValueAndPredictionsSet
    VAPs_represent: VAPsType
    wcomponent: WComponent
    sort?: boolean
}
interface VAPVisual
{
    VAP_id: string
    value_text: string
    value: ParsedValue
    certainty: number
}
export function get_VAP_visuals_data (args: GetVAPVisualsDataArgs): VAPVisual[]
{
    const cleaned_VAP_set = clean_VAP_set_entries(args.VAP_set, args.VAPs_represent)
    const expanded_VAP_set = expand_booleans(cleaned_VAP_set, args.VAPs_represent)

    const shared_conviction = expanded_VAP_set.shared_entry_values?.conviction
    let total_certainties = 0


    const boolean_representation = get_boolean_representation({ wcomponent: args.wcomponent })
    const data: VAPVisual[] = expanded_VAP_set.entries.map((VAP, index) =>
    {
        let value = parse_VAP_value(VAP, args.VAPs_represent)
        if (args.VAPs_represent === VAPsType.boolean)
        {
            value = index === 0
        }
        const value_text = VAP_value_to_string(value, boolean_representation)
        const certainty = VAP.probability * (shared_conviction !== undefined ? shared_conviction : VAP.conviction)
        total_certainties += certainty

        return {
            VAP_id: VAP.id,
            value_text,
            certainty,
            value,
        }
    })


    // TODO protect against unstable sort when percentage_height is the same
    const should_sort = args.sort === undefined || args.sort
    const sorted_data = should_sort ? sort_list(data, i => i.certainty, "descending") : data

    // Always put uncertain value last
    const uncertainty = 1 - total_certainties
    sorted_data.push({
        VAP_id: VAP_visual_uncertainty_id,
        value_text: "?",
        certainty: uncertainty,
        value: null, // should result in `undefined` as a judgemnet
    })

    return sorted_data
}



function expand_booleans (VAP_set: StateValueAndPredictionsSet, VAPs_represent: VAPsType)
{
    if (VAPs_represent === VAPsType.boolean)
    {
        const VAP_true = VAP_set.entries[0]
        if (!VAP_true) return VAP_set

        const VAP_false = {
            ...VAP_true,
            probability: 1 - VAP_true.probability,
            id: VAP_visual_false_id,
            description: "",
        }

        const entries = [...VAP_set.entries, VAP_false ]
        VAP_set = { ...VAP_set, entries }
    }

    return VAP_set
}
