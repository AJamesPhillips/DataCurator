import type { Base } from "../../../shared/interfaces/base"



export interface MergeDataCoreArgs<U>
{
    last_source_of_truth_value: U
    current_value: U
    // source_of_truth represents the value returned from the server (either 200 or 409),
    // NOT the value that was on the server before the attempted update.
    source_of_truth_value: U
    // i.e. 200 or 409 i.e. are you the last client to update this row or did a different
    // client already update it and you had an old modified_at datetimestamp?
    update_successful: boolean
}

interface MergeDataArgs<U> extends MergeDataCoreArgs<U>
{
    get_custom_field_merger: <T extends keyof U>(field: T) => (undefined | ((args: MergeDataCoreArgs<U>) => FieldMergerReturn<U, T>))
}

export interface MergeDataReturn<U>
{
    value: U
    needs_save: boolean
    unresolvable_conflicted_fields: (keyof U)[]
}

export function merge_base_object <U extends Base> (args: MergeDataArgs<U>): MergeDataReturn<U>
{
    const {
        last_source_of_truth_value,
        current_value,
        source_of_truth_value,
        get_custom_field_merger,
    } = args


    let value = { ...source_of_truth_value }
    let needs_save = false
    let unresolvable_conflicted_fields: (keyof U)[] = []

    // const _debug_fields_needing_save: (keyof U)[] = []

    const fields = get_fields(current_value, last_source_of_truth_value, source_of_truth_value)
    fields.forEach(field =>
    {
        const field_merger = get_custom_field_merger(field) || get_default_base_object_field_merger(field)
        const merge = field_merger(args)
        // if (merge.needs_save) _debug_fields_needing_save.push(field)

        needs_save = needs_save || merge.needs_save
        if (merge.unresolvable_conflict) unresolvable_conflicted_fields.push(field)
        value[field] = merge.value
    })

    // console .log("_debug_fields_needing_save...", _debug_fields_needing_save)

    return { value, needs_save, unresolvable_conflicted_fields }
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



export interface FieldMergerReturn <U, T extends keyof U>
{
    needs_save: boolean
    unresolvable_conflict: boolean
    value: U[T]
}

function get_default_base_object_field_merger <U extends Base, T extends keyof U> (field: T)
{
    const always_current_value_fields: Set<keyof U> = new Set([
        "needs_save",
        "saving",
    ])

    const always_source_of_truth_fields: Set<keyof U> = new Set([
        "id",
        "created_at",
        "modified_at",
    ])


    function default_field_merger (args: MergeDataCoreArgs<U>): FieldMergerReturn<U, T>
    {
        const source_of_truth_field_value = args.source_of_truth_value[field]
        const current_field_value = args.current_value[field]


        let needs_save = false
        let unresolvable_conflict = false


        if (always_current_value_fields.has(field))
        {
            return { needs_save, unresolvable_conflict, value: current_field_value }
        }


        if (always_source_of_truth_fields.has(field))
        {
            return { needs_save, unresolvable_conflict, value: source_of_truth_field_value }
        }

        return get_default_field_merger<U, T>(field)(args)
    }


    return default_field_merger
}



export function get_default_field_merger <U extends object, T extends keyof U> (field: T)
{
    function are_equal (a: U[T], b: U[T])
    {
        return JSON.stringify(a) === JSON.stringify(b)
    }


    function default_field_merger (args: MergeDataCoreArgs<U>): FieldMergerReturn<U, T>
    {
        const source_of_truth_field_value = args.source_of_truth_value[field]
        const current_field_value = args.current_value[field]
        const last_source_of_truth_field_value = args.last_source_of_truth_value[field]


        let needs_save = false
        let unresolvable_conflict = false
        let value: U[T]

        if (args.update_successful || are_equal(source_of_truth_field_value, last_source_of_truth_field_value))
        {
            value = current_field_value
            needs_save = !are_equal(current_field_value, source_of_truth_field_value)
        }
        else
        {
            value = source_of_truth_field_value
            if (!are_equal(current_field_value, last_source_of_truth_field_value))
            {
                unresolvable_conflict = !are_equal(current_field_value, source_of_truth_field_value)
                if (unresolvable_conflict)
                {
                    console .log("unresolvable_conflict with field: ", field, "last_source_of_truth_field_value", last_source_of_truth_field_value, "source_of_truth_field_value", source_of_truth_field_value, "current_field_value", current_field_value)
                }
            }
        }

        return { needs_save, unresolvable_conflict, value }
    }


    return default_field_merger
}
