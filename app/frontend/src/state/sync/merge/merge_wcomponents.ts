import { test } from "../../../shared/utils/test"
import { prepare_new_contextless_wcomponent_object } from "../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import type { WComponent } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { MergeDataCoreArgs, MergeDataReturn, merge_base_object } from "./merge_data"



export function merge_wcomponent (args: MergeDataCoreArgs<WComponent>): MergeDataReturn<WComponent>
{
    return merge_base_object({ ...args, get_custom_field_merger })
}



function get_custom_field_merger (field: keyof WComponent)
{
    return undefined
}



function run_tests ()
{
    const dt1 = new Date("2021-01-01")
    // Either the modified_at values match (between attempted_update_value and the DB's initial value)
    // and will result in an update, a new modified_at and a 200 response code.
    // OR they will not match, the current DB value will be returned with a 409 response code.
    const latest_modified_at = new Date("2021-02-02")


    function dt_ms (date?: Date, warn_when_undefined = true)
    {
        if (!date && warn_when_undefined)
        {
            throw new Error("Datetime is undefined.  Set warn_when_undefined = false?")
        }

        return date ? date.getTime() : undefined
    }


    test_should_handle_update_on_client()
    test_should_handle_nonconflicting_updates()
    test_should_handle_conflicting_updates()

    test_should_handle_multiple_updates_on_client()
    test_should_handle_nonconflicting_updates_with_multiple_client_updates()
    test_should_handle_conflicting_updates_with_multiple_client_updates()

    test_should_handle_non_and_conflicting_updates()
    test_should_handle_non_and_conflicting_updates_with_multiple_client_updates()

    test_should_handle_different_custom_created_at()



    function test_should_handle_update_on_client ()
    {
        const last_source_of_truth_value: WComponent = prepare_new_contextless_wcomponent_object({
            base_id: -1, title: "TA", modified_at: dt1,
        })
        const current_value: WComponent = { ...last_source_of_truth_value, title: "TB", needs_save: true, saving: true }
        const attempted_update_value: WComponent = { ...last_source_of_truth_value, title: "TB" }
        const source_of_truth_value: WComponent = { ...last_source_of_truth_value, title: "TB", modified_at: latest_modified_at }

        const merge = merge_wcomponent({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: true, // 200
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.title, "TB")

        test(merge.needs_save, false)
        test(merge.unresolvable_conflicted_fields, [])
    }


    function test_should_handle_nonconflicting_updates ()
    {
        const last_source_of_truth_value: WComponent = prepare_new_contextless_wcomponent_object({
            base_id: -1, title: "TA", description: "DA", modified_at: dt1,
        })
        const current_value: WComponent = { ...last_source_of_truth_value, title: "TB", needs_save: true, saving: true }
        const attempted_update_value: WComponent = { ...last_source_of_truth_value, title: "TB" }
        const source_of_truth_value: WComponent = { ...last_source_of_truth_value, title: "TA", description: "DX", modified_at: latest_modified_at }

        const merge = merge_wcomponent({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.title, "TB")
        test(merge.value.description, "DX")

        test(merge.needs_save, true)
        test(merge.unresolvable_conflicted_fields, [])
    }


    function test_should_handle_conflicting_updates ()
    {
        const last_source_of_truth_value: WComponent = prepare_new_contextless_wcomponent_object({
            base_id: -1, title: "TA", modified_at: dt1,
        })
        const current_value: WComponent = { ...last_source_of_truth_value, title: "TB", needs_save: true, saving: true }
        const attempted_update_value: WComponent = { ...last_source_of_truth_value, title: "TB" }
        const source_of_truth_value: WComponent = { ...last_source_of_truth_value, title: "TX", modified_at: latest_modified_at }

        const merge = merge_wcomponent({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.title, "TX")

        // There's nothing here that needs to be updated
        test(merge.needs_save, false)
        test(merge.unresolvable_conflicted_fields, ["title"])
    }


    function test_should_handle_multiple_updates_on_client ()
    {
        const last_source_of_truth_value: WComponent = prepare_new_contextless_wcomponent_object({
            base_id: -1, title: "TA", modified_at: dt1,
        })
        // Client makes second change from TB to TC
        const current_value: WComponent = { ...last_source_of_truth_value, title: "TC", needs_save: true, saving: true }
        // Represents first change from TA to TB
        const attempted_update_value: WComponent = { ...last_source_of_truth_value, title: "TB" }
        const source_of_truth_value: WComponent = { ...last_source_of_truth_value, title: "TB", modified_at: latest_modified_at }

        const merge = merge_wcomponent({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: true, // 200
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.title, "TC")
        test(merge.needs_save, true)
        test(merge.unresolvable_conflicted_fields, [])
    }


    function test_should_handle_nonconflicting_updates_with_multiple_client_updates ()
    {
        const last_source_of_truth_value: WComponent = prepare_new_contextless_wcomponent_object({
            base_id: -1, title: "TA", description: "DA", modified_at: dt1,
        })
        // Client makes second change from TB to TC
        const current_value: WComponent = { ...last_source_of_truth_value, title: "TC", needs_save: true, saving: true }
        // Represents first change from TA to TB
        const attempted_update_value: WComponent = { ...last_source_of_truth_value, title: "TB" }
        const source_of_truth_value: WComponent = { ...last_source_of_truth_value, title: "TA", description: "DX", modified_at: latest_modified_at }

        const merge = merge_wcomponent({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.title, "TC")
        test(merge.value.description, "DX")

        test(merge.needs_save, true)
        test(merge.unresolvable_conflicted_fields, [])
    }


    function test_should_handle_conflicting_updates_with_multiple_client_updates ()
    {
        const last_source_of_truth_value: WComponent = prepare_new_contextless_wcomponent_object({
            base_id: -1, title: "TA", modified_at: dt1,
        })
        // Client makes second change from TB to TC
        const current_value: WComponent = { ...last_source_of_truth_value, title: "TC", needs_save: true, saving: true }
        // Represents first change from TA to TB
        const attempted_update_value: WComponent = { ...last_source_of_truth_value, title: "TB" }
        const source_of_truth_value: WComponent = { ...last_source_of_truth_value, title: "TX", modified_at: latest_modified_at }

        const merge = merge_wcomponent({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.title, "TX")

        // There's nothing here that needs to be updated
        test(merge.needs_save, false)
        test(merge.unresolvable_conflicted_fields, ["title"])
    }


    function test_should_handle_non_and_conflicting_updates ()
    {
        const last_source_of_truth_value: WComponent = prepare_new_contextless_wcomponent_object({
            base_id: -1, title: "TA", description: "DA", modified_at: dt1,
        })
        const current_value: WComponent = { ...last_source_of_truth_value, title: "TB", description: "DB", needs_save: true, saving: true }
        const attempted_update_value: WComponent = { ...last_source_of_truth_value, title: "TB", description: "DB" }
        const source_of_truth_value: WComponent = { ...last_source_of_truth_value, title: "TA", description: "DX", modified_at: latest_modified_at }

        const merge = merge_wcomponent({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.title, "TB")
        test(merge.value.description, "DX")

        // Need to save the title
        test(merge.needs_save, true)
        test(merge.unresolvable_conflicted_fields, ["description"])
    }


    function test_should_handle_non_and_conflicting_updates_with_multiple_client_updates ()
    {
        const last_source_of_truth_value: WComponent = prepare_new_contextless_wcomponent_object({
            base_id: -1, title: "TA", description: "DA", modified_at: dt1,
        })
        // Client makes second change from TB to TC and DB to DC
        const current_value: WComponent = { ...last_source_of_truth_value, title: "TC", description: "DC", needs_save: true, saving: true }
        // Represents first change from TA to TB and DA to DB
        const attempted_update_value: WComponent = { ...last_source_of_truth_value, title: "TB", description: "DB" }
        const source_of_truth_value: WComponent = { ...last_source_of_truth_value, title: "TA", description: "DX", modified_at: latest_modified_at }

        const merge = merge_wcomponent({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.title, "TC")
        test(merge.value.description, "DX")

        // Need to save the title
        test(merge.needs_save, true)
        test(merge.unresolvable_conflicted_fields, ["description"])
    }


    function test_should_handle_different_custom_created_at ()
    {
        const last_source_of_truth_value: WComponent = prepare_new_contextless_wcomponent_object({
            base_id: -1, custom_created_at: new Date("2021"), modified_at: dt1,
        })
        const current_value: WComponent = { ...last_source_of_truth_value, custom_created_at: new Date("2015"), needs_save: true, saving: true }
        const attempted_update_value: WComponent = { ...last_source_of_truth_value, custom_created_at: new Date("2015") }
        const source_of_truth_value: WComponent = { ...last_source_of_truth_value, custom_created_at: new Date("2015"), modified_at: latest_modified_at }

        const merge = merge_wcomponent({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: true, // 200
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(new Date("2021"), new Date("2021"))
        test(merge.value.custom_created_at, new Date("2015"))

        test(merge.needs_save, false)
        test(merge.unresolvable_conflicted_fields, [])
    }
}



// run_tests()
