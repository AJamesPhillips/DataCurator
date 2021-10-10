import type { ValuePossibilitiesById, ValuePossibility } from "../../../wcomponent/interfaces/possibility"



export function get_value_possibilities_by_value (value_possibilities: ValuePossibilitiesById | undefined, lower_case: boolean)
{
    const value_possibility_ids_by_value: {[value: string]: ValuePossibility} = {}
    Object.values(value_possibilities || {})
        .forEach(value_possibility =>
        {
            const key = lower_case ? value_possibility.value.toLowerCase() : value_possibility.value
            value_possibility_ids_by_value[key] = value_possibility
        })

    return value_possibility_ids_by_value
}
