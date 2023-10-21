import { KnowledgeView, KnowledgeViewWComponentEntry } from "../../../shared/interfaces/knowledge_view"
import { describe, test } from "../../../shared/utils/test"
import { uuid_v4_for_tests } from "../../../utils/uuid_v4_for_tests"
import { ComposedWcIdMapsObject, get_composed_wc_id_maps_object } from "./get_composed_wc_id_map"



const wcomponent_id = uuid_v4_for_tests(1)

function test_helper__make_knowledge_view (kv_wc_entry: KnowledgeViewWComponentEntry | undefined, kv_id: string, foundational_kv_id?: string)
{
    const date1 = new Date("2023-03-22 15:15:00")

    const kv: KnowledgeView = {
        id: kv_id,
        foundation_knowledge_view_ids: foundational_kv_id ? [foundational_kv_id] : undefined,
        wc_id_map: {},

        title: "",
        description: "",
        sort_type: "normal",
        created_at: date1,
        base_id: 1,
        goal_ids: [],
    }

    if (kv_wc_entry) kv.wc_id_map[wcomponent_id] = kv_wc_entry

    return kv
}



export const test_get_composed_wc_id_map = describe("get_composed_wc_id_map", () =>
{
    const date1 = new Date("2023-03-22 15:15:00")

    let result: ComposedWcIdMapsObject
    let expected_result: ComposedWcIdMapsObject


    // Test get_composed_wc_id_map handles no data
    result = get_composed_wc_id_maps_object([], {})
    expected_result =
    {
        composed_wc_id_map: {},
        composed_blocked_wc_id_map: {},
    }
    test(result, expected_result)


    interface TestCase
    {
        // the wcomponent entry in the current knowledge view
        kv_wc_entry_in_current_kv: KnowledgeViewWComponentEntry | undefined
        // the wcomponent entry in the foundation knowledge view
        kv_wc_entry_in_foundation_kv: KnowledgeViewWComponentEntry | undefined

        expected_result_in_composed_wc_id_map: KnowledgeViewWComponentEntry | undefined
        expected_result_in_composed_blocked_wc_id_map: KnowledgeViewWComponentEntry | undefined

        test_description: string
        test_description_part2: string
    }

    const test_cases: TestCase[] = [
        // No entry in current_kv
        {
            kv_wc_entry_in_current_kv:    undefined,
            kv_wc_entry_in_foundation_kv: undefined,
            expected_result_in_composed_wc_id_map: undefined,
            expected_result_in_composed_blocked_wc_id_map: undefined,
            test_description: "missing in current, missing in foundation, ",
            test_description_part2: "should find no entry to return",
        },
        {
            kv_wc_entry_in_current_kv:    undefined,
            kv_wc_entry_in_foundation_kv: { left: 0, top: 0 },
            expected_result_in_composed_wc_id_map: { left: 0, top: 0 },
            expected_result_in_composed_blocked_wc_id_map: undefined,
            test_description: "missing in current, defined in foundation, ",
            test_description_part2: "should return entry in foundation",
        },
        {
            kv_wc_entry_in_current_kv:    undefined,
            kv_wc_entry_in_foundation_kv: { left: 0, top: 0, passthrough: true },
            expected_result_in_composed_wc_id_map: undefined,
            expected_result_in_composed_blocked_wc_id_map: undefined,
            test_description: "missing in current, passthrough in foundation, ",
            test_description_part2: "should find no entry to return",
        },
        {
            kv_wc_entry_in_current_kv:    undefined,
            kv_wc_entry_in_foundation_kv: { left: 0, top: 0, blocked: true },
            expected_result_in_composed_wc_id_map: undefined,
            expected_result_in_composed_blocked_wc_id_map: { left: 0, top: 0, blocked: true },
            test_description: "missing in current, blocked in foundation, ",
            test_description_part2: "should return entry in blocked",
        },
        // Normal entry in current_kv
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222 },
            kv_wc_entry_in_foundation_kv: undefined,
            expected_result_in_composed_wc_id_map: { left: 222, top: 222 },
            expected_result_in_composed_blocked_wc_id_map: undefined,
            test_description: "normal entry in current, missing in foundation, ",
            test_description_part2: "should return entry in current not foundation",
        },
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222 },
            kv_wc_entry_in_foundation_kv: { left: 0,   top: 0 },
            expected_result_in_composed_wc_id_map: { left: 222, top: 222 },
            expected_result_in_composed_blocked_wc_id_map: undefined,
            test_description: "normal entry in current, defined in foundation, ",
            test_description_part2: "should return entry in current not foundation",
        },
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222 },
            kv_wc_entry_in_foundation_kv: { left: 0,   top: 0, passthrough: true },
            expected_result_in_composed_wc_id_map: { left: 222, top: 222 },
            expected_result_in_composed_blocked_wc_id_map: undefined,
            test_description: "normal entry in current, passthrough in foundation, ",
            test_description_part2: "should return entry in current not foundation",
        },
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222 },
            kv_wc_entry_in_foundation_kv: { left: 0,   top: 0, blocked: true },
            expected_result_in_composed_wc_id_map: { left: 222, top: 222 },
            expected_result_in_composed_blocked_wc_id_map: undefined,
            test_description: "normal entry in current, blocked in foundation, ",
            test_description_part2: "should return entry in current not foundation and NOT show foundation's blocked entry in composed_blocked_wc_id_map",
        },
        // Passthrough entry in current_kv
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222, passthrough: true },
            kv_wc_entry_in_foundation_kv: undefined,
            expected_result_in_composed_wc_id_map: undefined,
            expected_result_in_composed_blocked_wc_id_map: undefined,
            test_description: "passthrough entry in current, missing in foundation, ",
            test_description_part2: "should find no entry to return",
        },
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222, passthrough: true },
            kv_wc_entry_in_foundation_kv: { left: 0,   top: 0 },
            expected_result_in_composed_wc_id_map: { left: 0, top: 0 },
            expected_result_in_composed_blocked_wc_id_map: undefined,
            test_description: "passthrough entry in current, defined in foundation, ",
            test_description_part2: "should return (passthrough) entry from foundation",
        },
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222, passthrough: true },
            kv_wc_entry_in_foundation_kv: { left: 0,   top: 0, passthrough: true },
            expected_result_in_composed_wc_id_map: undefined,
            expected_result_in_composed_blocked_wc_id_map: undefined,
            test_description: "passthrough entry in current, passthrough in foundation, ",
            test_description_part2: "should find no entry to return",
        },
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222, passthrough: true },
            kv_wc_entry_in_foundation_kv: { left: 0,   top: 0, blocked: true },
            expected_result_in_composed_wc_id_map: undefined,
            expected_result_in_composed_blocked_wc_id_map: { left: 0,   top: 0, blocked: true },
            test_description: "passthrough entry in current, blocked in foundation, ",
            test_description_part2: "should find no entry to return and show foundation's blocked entry in composed_blocked_wc_id_map",
        },
        // Blocked entry in current_kv
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222, blocked: true },
            kv_wc_entry_in_foundation_kv: undefined,
            expected_result_in_composed_wc_id_map: undefined,
            expected_result_in_composed_blocked_wc_id_map: { left: 222, top: 222, blocked: true },
            test_description: "blocked entry in current, missing in foundation, ",
            test_description_part2: "should find no entry to return and show blocked entry from current kv in composed_blocked_wc_id_map",
        },
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222, blocked: true },
            kv_wc_entry_in_foundation_kv: { left: 0,   top: 0 },
            expected_result_in_composed_wc_id_map: undefined,
            expected_result_in_composed_blocked_wc_id_map: { left: 222, top: 222, blocked: true },
            test_description: "blocked entry in current, defined in foundation, ",
            test_description_part2: "should find no entry to return and show blocked entry from current kv in composed_blocked_wc_id_map",
        },
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222, blocked: true },
            kv_wc_entry_in_foundation_kv: { left: 0,   top: 0, passthrough: true },
            expected_result_in_composed_wc_id_map: undefined,
            expected_result_in_composed_blocked_wc_id_map: { left: 222, top: 222, blocked: true },
            test_description: "blocked entry in current, passthrough in foundation, ",
            test_description_part2: "should find no entry to return and show blocked entry from current kv in composed_blocked_wc_id_map",
        },
        {
            kv_wc_entry_in_current_kv:    { left: 222, top: 222, blocked: true },
            kv_wc_entry_in_foundation_kv: { left: 0,   top: 0, blocked: true },
            expected_result_in_composed_wc_id_map: undefined,
            expected_result_in_composed_blocked_wc_id_map: { left: 222, top: 222, blocked: true },
            test_description: "blocked entry in current, blocked in foundation, ",
            test_description_part2: "should find no entry to return and show blocked entry from current kv in composed_blocked_wc_id_map",
        },
    ]


    test_cases.forEach(test_case =>
    {
        const foundation_knowledge_view = test_helper__make_knowledge_view(test_case.kv_wc_entry_in_foundation_kv, "kv1")
        const current_knowledge_view = test_helper__make_knowledge_view(test_case.kv_wc_entry_in_current_kv, "kv2", "kv1")

        result = get_composed_wc_id_maps_object([
            foundation_knowledge_view,
            current_knowledge_view,
        ], {})

        test(result.composed_wc_id_map[wcomponent_id], test_case.expected_result_in_composed_wc_id_map, "composed_wc_id_map " + test_case.test_description + test_case.test_description_part2)
        test(result.composed_blocked_wc_id_map[wcomponent_id], test_case.expected_result_in_composed_blocked_wc_id_map, "composed_blocked_wc_id_map " + test_case.test_description + test_case.test_description_part2)
    })


    describe("deleted wcomponent", () =>
    {
        test_cases.forEach(test_case =>
        {
            const foundation_knowledge_view = test_helper__make_knowledge_view(test_case.kv_wc_entry_in_foundation_kv, "kv1")
            const current_knowledge_view = test_helper__make_knowledge_view(test_case.kv_wc_entry_in_current_kv, "kv2", "kv1")

            result = get_composed_wc_id_maps_object([
                foundation_knowledge_view,
                current_knowledge_view,
            ], {
                [wcomponent_id]:
                {
                    id: wcomponent_id,
                    deleted_at: date1,

                    type: "statev2",
                    title: "",
                    description: "",
                    created_at: date1,
                    base_id: 1,
                }
            })

            test(result.composed_wc_id_map[wcomponent_id], undefined, "composed_wc_id_map " + test_case.test_description + "should not return any entry")
            test(result.composed_blocked_wc_id_map[wcomponent_id], undefined, "composed_blocked_wc_id_map " + test_case.test_description + "should not return any entry")
        })
    })


}, false)
