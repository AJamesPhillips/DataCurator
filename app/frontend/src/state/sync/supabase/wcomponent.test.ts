import { describe, test } from "../../../../lib/datacurator-core/src/utils/test"
import { prepare_new_contextless_wcomponent_object } from "../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponent } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { wcomponent_app_to_supabase, wcomponent_supabase_to_app } from "./wcomponent"


export const test_wcomponent_supabase_to_app = describe.delay("wcomponent_supabase_to_app", () =>
{
    function pretend_to_save_and_load_wcomponent (wcomponent: WComponent): WComponent | undefined
    {
        // Simulate saving the wcomponent to Supabase and then loading it back
        let supabase_wcomponent = wcomponent_app_to_supabase(wcomponent)
        let saved_supabase_wcomponent = {
            ...supabase_wcomponent,
            // Set a specific modified_at date for testing
            modified_at: "2025-06-06T00:00:00",
        }
        return wcomponent_supabase_to_app(saved_supabase_wcomponent)
    }

    let wcomponent = prepare_new_contextless_wcomponent_object({ type: "statev2", base_id: -1 })
    let result = pretend_to_save_and_load_wcomponent(wcomponent)
    test(!!result, true, "should return a valid wcomponent statev2 object")

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wcomponent.type = "an old unsupported component type" as any
    result = pretend_to_save_and_load_wcomponent(wcomponent)
    test(result, undefined, "should filter out wcomponent types which are unsupported")
})
