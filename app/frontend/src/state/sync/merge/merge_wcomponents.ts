import { test } from "../../../shared/utils/test"
import { get_contextless_new_wcomponent_object } from "../../../shared/wcomponent/get_new_wcomponent_object"
import type { WComponent } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { MergeDataCoreArgs, MergeDataReturn, merge_data } from "./merge_data"



export function merge_wcomponent (args: MergeDataCoreArgs<WComponent>): MergeDataReturn<WComponent>
{

    return merge_data({ ...args, get_field_value, get_custom_field_merger })
}



function get_field_value (field: keyof WComponent, wcomponent: WComponent)
{
    return wcomponent[field]
}


function get_custom_field_merger (field: keyof WComponent)
{
    return undefined
}



function run_tests()
{
    const dt1 = new Date("2021-01-01")
    const dt2 = new Date("2021-02-02")
    const dt3 = new Date("2021-03-03")


    function dt_ms (date?: Date)
    {
        return date ? date.getTime() : undefined
    }


    test_should_handle_create_on_client()
    test_should_handle_update_on_client()
    test_should_handle_nonconflicting_updates()
    test_should_handle_conflicting_updates()

    test_should_handle_multiple_updates_on_client()
    test_should_handle_nonconflicting_updates_with_multiple_client_updates()
    test_should_handle_conflicting_updates_with_multiple_client_updates()

    test_should_handle_different_custom_created_at()



    function test_should_handle_create_on_client ()
    {

    }


    function test_should_handle_update_on_client ()
    {
        const last_source_of_truth: WComponent = get_contextless_new_wcomponent_object({
            title: "TA", description: "DA", modified_at: dt1,
        })
        const current_value: WComponent = { ...last_source_of_truth, title: "TB", needs_save: true, saving: true }
        const attempted_update_value: WComponent = { ...current_value, needs_save: undefined, saving: undefined }
        const source_of_truth: WComponent = { ...current_value, needs_save: undefined, saving: undefined, modified_at: dt2 }

        const merge = merge_wcomponent({
            last_source_of_truth,
            current_value,
            attempted_update_value,
            source_of_truth,
            update_successful: true,
        })

        test(merge.conflict, false)
        test(dt_ms(merge.value.modified_at), dt_ms(source_of_truth.modified_at))
        test(merge.value.title, "TB")
        test(merge.value.description, "DA")
    }


    function test_should_handle_nonconflicting_updates ()
    {

    }


    function test_should_handle_conflicting_updates ()
    {

    }


    function test_should_handle_multiple_updates_on_client ()
    {

    }


    function test_should_handle_nonconflicting_updates_with_multiple_client_updates ()
    {

    }


    function test_should_handle_conflicting_updates_with_multiple_client_updates ()
    {

    }


    function test_should_handle_different_custom_created_at ()
    {

    }
}



run_tests()
