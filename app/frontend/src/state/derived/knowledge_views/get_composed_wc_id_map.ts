import { KnowledgeView, KnowledgeViewWComponentIdEntryMap } from "../../../shared/interfaces/knowledge_view"
import { test } from "../../../shared/utils/test"
import { WComponentsById, wcomponent_is_deleted } from "../../../wcomponent/interfaces/SpecialisedObjects"



interface GetComposedWcIdMapReturn
{
    composed_wc_id_map: KnowledgeViewWComponentIdEntryMap
    composed_blocked_wc_id_map: KnowledgeViewWComponentIdEntryMap
}

export function get_composed_wc_id_map (foundation_knowledge_views: KnowledgeView[], wcomponents_by_id: WComponentsById): GetComposedWcIdMapReturn
{
    let composed_wc_id_map: KnowledgeViewWComponentIdEntryMap = {}
    foundation_knowledge_views.forEach(foundational_kv =>
    {
        Object.entries(foundational_kv.wc_id_map).forEach(([id, entry]) =>
        {
            if (entry.passthrough) return

            // ensure it is deleted first so that when (re)added it will placed last (on top)
            delete composed_wc_id_map[id]
            composed_wc_id_map[id] = entry
        })
    })

    remove_deleted_wcomponents(composed_wc_id_map, wcomponents_by_id)

    const result = partition_wc_id_map_on_blocked(composed_wc_id_map)
    composed_wc_id_map = result.composed_wc_id_map
    const composed_blocked_wc_id_map = result.composed_blocked_wc_id_map

    return { composed_wc_id_map, composed_blocked_wc_id_map }
}


function remove_deleted_wcomponents (composed_wc_id_map: KnowledgeViewWComponentIdEntryMap, wcomponents_by_id: WComponentsById)
{
    Object.keys(composed_wc_id_map).forEach(id =>
    {
        const wcomponent = wcomponents_by_id[id]
        // Allow not found wcomponents to be kept as they may be from a different base and just not loaded
        // if (!wcomponent) delete composed_wc_id_map[id]
        if (wcomponent_is_deleted(wcomponent)) delete composed_wc_id_map[id]
    })
}


function partition_wc_id_map_on_blocked (composed_wc_id_map: KnowledgeViewWComponentIdEntryMap): GetComposedWcIdMapReturn
{
    const composed_blocked_wc_id_map: KnowledgeViewWComponentIdEntryMap = {}

    Object.entries(composed_wc_id_map).forEach(([wcomponent_id, entry]) =>
    {
        if (entry.blocked)
        {
            composed_blocked_wc_id_map[wcomponent_id] = entry
            delete composed_wc_id_map[wcomponent_id]
        }
    })

    return { composed_wc_id_map, composed_blocked_wc_id_map }
}



function run_tests ()
{
    console .log("running tests of get_composed_wc_id_map etc")

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

}

// run_tests()
