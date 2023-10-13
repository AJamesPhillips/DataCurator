import { describe, test } from "../../../shared/utils/test"
import { GetComposedWcIdMapReturn, get_composed_wc_id_map } from "./get_composed_wc_id_map"



export const test_get_composed_wc_id_map = describe("get_composed_wc_id_map", () =>
{
    const date1 = new Date("2023-03-22 15:15:00")

    // Test get_composed_wc_id_map handles no data
    let result = get_composed_wc_id_map([], {})
    let expected_result: GetComposedWcIdMapReturn =
    {
        composed_wc_id_map: {},
        composed_blocked_wc_id_map: {},
    }
    test(result, expected_result)


    // Test get_composed_wc_id_map handles nested knowledge view with
    // passthrough, and blocked entries and deleted wcomponents
    const deleted_wcomponent_id = "wc6"
    result = get_composed_wc_id_map([
        {
            id: "kv1",
            wc_id_map:
            {
                "wc1": { left: 0,  top: 0 },
                "wc2": { left: 10, top: 0, passthrough: true },
                "wc3": { left: 20, top: 0, blocked: true },
                "wc4": { left: 30, top: 0 },
                "wc5": { left: 40, top: 0 },
                [deleted_wcomponent_id]: { left: 50, top: 0 },
            },

            title: "a1",
            description: "b1",
            sort_type: "normal",
            created_at: date1,
            base_id: 1,
            goal_ids: [],
        },
        {
            id: "kv2",
            foundation_knowledge_view_ids: ["kv1"],
            wc_id_map:
            {
                "wc1": { left: 0,  top: 10 },
                "wc2": { left: 10, top: 10 },
                "wc3": { left: 20, top: 10 },
                "wc4": { left: 30, top: 10, passthrough: true },
                "wc5": { left: 40, top: 10, blocked: true },
            },

            title: "a2",
            description: "b2",
            sort_type: "normal",
            created_at: date1,
            base_id: 1,
            goal_ids: [],
        },
    ],
    {
        [deleted_wcomponent_id]:
        {
            id: deleted_wcomponent_id,
            deleted_at: date1,

            type: "statev2",
            // goals: {},
            title: "",
            description: "",
            created_at: date1,
            base_id: 1,
            // datetime: {},
        }
    })

    expected_result =
    {
        composed_wc_id_map:
        {
            "wc1": { left: 0,  top: 10 },
            "wc2": { left: 10, top: 10 },
            "wc3": { left: 20, top: 10 },
            "wc4": { left: 30, top: 0 },
        },
        composed_blocked_wc_id_map:
        {
            "wc5": { left: 40, top: 10, blocked: true },
        },
    }

    test(result, expected_result)

}, false)
