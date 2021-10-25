import type {
    StateValueAndPrediction as VAP,
    StateValueAndPredictionsSet as VAPSet,
} from "../../wcomponent/interfaces/state"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import { VALUE_POSSIBILITY_IDS } from "../../wcomponent/value/parse_value"
import type { VAPVisual } from "../interfaces/value"



export const VAP_visual_uncertainty_id = "VAP_uncertainty_id__undefined__"
// const VAP_visual_true_id // we should NEVER use this, VAP ids are a unique identify for an
// attribute, at a point in time for a possible value.  We allow the use of VAP_false_id__undefined__
// because this will always be present.
export const VAP_visual_false_id = "VAP_false_id__undefined__"



export function ensure_VAP_set_entries_consistent_with_representing_type <E extends VAPSet> (VAP_set: E, VAPs_represent: VAPsType): E
{
    let subtype_specific_VAPs = VAPs_represent === VAPsType.boolean
        ? VAP_set.entries.slice(0, 1)
        : VAP_set.entries

    subtype_specific_VAPs = expand_booleans(subtype_specific_VAPs, VAPs_represent)

    return { ...VAP_set, entries: subtype_specific_VAPs }
}



function expand_booleans (entries: VAP[], VAPs_represent: VAPsType)
{
    if (VAPs_represent === VAPsType.boolean)
    {
        const VAP_true = entries[0]
        if (!VAP_true) return entries // type guard, should always have only one entry once this function is called

        const VAP_false: VAP = {
            ...VAP_true,
            probability: 1 - VAP_true.probability,
            id: VAP_visual_false_id,
            value_id: VALUE_POSSIBILITY_IDS.boolean_false,
            description: "",
        }

        entries = [{...VAP_true, value_id: VALUE_POSSIBILITY_IDS.boolean_true}, VAP_false ]
    }

    return entries
}



export function add_uncertain_VAP_visual (total_certainties: number, VAP_visuals: VAPVisual[]): VAPVisual[]
{
    const uncertainty = 1 - total_certainties
    const uncertainty_VAP_visual: VAPVisual = {
        VAP_id: VAP_visual_uncertainty_id,
        value_id: VALUE_POSSIBILITY_IDS.uncertainty,
        value_text: "?",
        certainty: uncertainty,
        parsed_value: null, // should result in `undefined` as a judgemnet
    }

    // Put uncertain value last
    return [...VAP_visuals, uncertainty_VAP_visual]
}
