import type {
    SimpleValuePossibility,
    ValuePossibilitiesById,
} from "../../../wcomponent/interfaces/possibility"



export function get_max_value_possibilities_order (value_possibilities: SimpleValuePossibility[] | ValuePossibilitiesById | undefined): number
{
    let max_order = -1

    if (value_possibilities)
    {
        let values_array: SimpleValuePossibility[]
        if (Array.isArray(value_possibilities)) values_array = value_possibilities
        else values_array = Object.values(value_possibilities)

        values_array.forEach(({ order = -1 }) => max_order = Math.max(max_order, order))
    }

    return max_order
}
