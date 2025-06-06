import { describe, test } from "../../../../lib/datacurator-core/src/utils/test"
import { SupabaseReadItem } from "../../../supabase/interfaces"
import { supabase_item_to_app } from "./item_convertion"


export const test_supabase_item_to_app = describe.delay("supabase_item_to_app", () =>
{
    const supabase_item: SupabaseReadItem<{ id: string, modified_at: Date, base_id: number, title: string }> = {
        id: "123",
        title: "-some title",
        base_id: 111,
        modified_at: "2025-06-06T00:00:00",
        json: {
            modified_at: new Date("1970-06-06T00:00:00"),
            id: "-2",
            base_id: -1,
            title: "Test Item",
        }
    }
    const app_item = supabase_item_to_app(supabase_item)

    test(app_item.id, "123", "should use id from supabase field at top level of the table")
    test(app_item.base_id, 111, "should use base_id from supabase field at top level of the table")
    test(app_item.modified_at instanceof Date, true)
    test(app_item.modified_at.toISOString(), "2025-06-06T00:00:00.000Z", "Should use modified_at from supabase field at top level of the table and convert to Date object")

    test(app_item.title, "Test Item", "should use title from json field in supabase item, not the title field.  The canonical value is in the DB's json field not the title field.")
})
