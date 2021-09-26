import type { Base } from "../../../shared/interfaces/base"



export interface MergeDataCoreArgs<U>
{
    last_source_of_truth: U
    current_value: U
    attempted_update_value: U
    source_of_truth: U
    // i.e. 200 or 409 i.e. are you the last client to update this row or did a different
    // client already update it and you had an old modified_at datetimestamp?
    update_successful: boolean
}

interface MergeDataArgs<U> extends MergeDataCoreArgs<U>
{
    get_field_value: <T extends keyof U>(field: T, item: U) => any
    get_custom_field_merger: <T extends keyof U>(field: T) => (undefined | ((args: MergeDataCoreArgs<U>) => { conflict: boolean, value: U[T] }))
}

export interface MergeDataReturn<U>
{
    conflict: boolean
    value: U
}

export function merge_data <U extends Base> (args: MergeDataArgs<U>): MergeDataReturn<U>
{
    const {
        last_source_of_truth,
        current_value,
        attempted_update_value,
        source_of_truth,
        update_successful,
        get_field_value,
        get_custom_field_merger,
    } = args

    const fields = get_fields(attempted_update_value, current_value, last_source_of_truth, source_of_truth)

    let conflict = false
    let value = { ...last_source_of_truth }

    fields.forEach(field =>
    {
        const field_merger = get_custom_field_merger(field) || get_default_field_merger(field)
        const merge = field_merger(args)
        // conflict = conflict || merge.conflict
        value[field] = merge.value
    })

    return { conflict, value }
}



function get_fields <U> (...items: U[]): (keyof U)[]
{
    const fields_set: Set<keyof U> = new Set()

    items.forEach(item =>
    {
        Object.keys(item).forEach(field =>
        {
            fields_set.add(field as keyof U)
        })
    })

    return Array.from(fields_set)
}



function get_default_field_merger <U extends Base, T extends keyof U> (field: T)
{
    function default_field_merger (args: MergeDataCoreArgs<U>): { conflict: boolean, value: U[T] }
    {
        if (field === "modified_at") return { conflict: false, value: args.source_of_truth[field] }

        return { conflict: false, value: args.attempted_update_value[field] }
    }

    return default_field_merger
}
