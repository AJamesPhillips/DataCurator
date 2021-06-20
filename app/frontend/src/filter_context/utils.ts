import type { CompoundFilter } from "../state/filter_context/state"


export function get_excluded_label_ids (filters: CompoundFilter[])
{
    const first_compound_filter = filters[0]
    const second_filters = !first_compound_filter ? [] : first_compound_filter.filters
    const first_specific_filter = (second_filters[0] && second_filters[0].type === "specific") ? second_filters[0] : undefined
    const label_ids: string[] = !first_specific_filter ? [] : first_specific_filter.label_ids


    const include = !!first_compound_filter && first_compound_filter.operation === "include"
    const exclude_label_ids: string[] = !include ? label_ids : []

    return exclude_label_ids
}
