import { KnowledgeView, KnowledgeViewWComponentEntry, KnowledgeViewWComponentIdEntryMap, KnowledgeViewsById } from "../../shared/interfaces/knowledge_view"
import { describe, test } from "../../shared/utils/test"
import { ComposedWcIdMapsObject, get_composed_wc_id_maps_object } from "../../state/derived/knowledge_views/get_composed_wc_id_maps_object"
import { get_foundational_knowledge_views } from "../../state/derived/knowledge_views/knowledge_views_derived_reducer"
import { uuid_v4_for_tests } from "../../utils/uuid_v4_for_tests"
import { WComponentsById } from "../../wcomponent/interfaces/SpecialisedObjects"
import {
    WComponentStatusInKnowledgeView,
    get_wcomponent_status_in_knowledge_view,
} from "./get_wcomponent_status_in_knowledge_view"



function test_helper__make_knowledge_view (wc_id_map: KnowledgeViewWComponentIdEntryMap, kv_id: string, foundational_kv_id?: string)
{
    const date1 = new Date("2023-03-22 15:15:00")

    const kv: KnowledgeView = {
        id: kv_id,
        foundation_knowledge_view_ids: foundational_kv_id ? [foundational_kv_id] : undefined,
        wc_id_map,

        title: "some title of " + kv_id,
        description: "",
        sort_type: "normal",
        created_at: date1,
        base_id: 1,
        goal_ids: [],
    }

    return kv
}


export const run_get_wcomponent_status_in_knowledge_view_tests = describe("get_UI_data__wcomponent_add_or_for_knowledge_view", () =>
{

    describe("simple single knowledge view with no foundation", () =>
    {

        const knowledge_view = test_helper__make_knowledge_view({
            // "wc1": never yet added to this knowledge view
            "wc2": { left: 20, top: 0 },
            "wc3": { left: 30, top: 0, passthrough: true },
            "wc4": { left: 40, top: 0, blocked: true },
        }, "kv1")
        const knowledge_views_by_id: KnowledgeViewsById = {
            [knowledge_view.id]: knowledge_view
        }

        const knowledge_views_stack = get_foundational_knowledge_views(knowledge_view, knowledge_views_by_id, true)
        const composed_wc_id_maps_object = get_composed_wc_id_maps_object(knowledge_views_stack, {})
        const knowledge_views_foundation_stack = get_foundational_knowledge_views(knowledge_view, knowledge_views_by_id, false)
        const foundation_composed_wc_id_maps_object = get_composed_wc_id_maps_object(knowledge_views_foundation_stack, {})

        const expected_composed_wc_id_maps_object: ComposedWcIdMapsObject =
        {
            composed_wc_id_map:
            {
                // wc1 won't be included
                "wc2": { left: 20, top: 0 },
                // wc3 won't be included
            },
            composed_blocked_wc_id_map:
            {
                "wc4": { left: 40, top: 0, blocked: true },
            },
        }
        test(composed_wc_id_maps_object, expected_composed_wc_id_maps_object, "Sanity check (no1) that we're still dealing with the same data structure from get_composed_wc_id_maps_object so that following tests are valid")

        const expected_foundation_composed_wc_id_maps_object: ComposedWcIdMapsObject =
        {
            composed_wc_id_map: {},
            composed_blocked_wc_id_map: {},
        }
        test(foundation_composed_wc_id_maps_object, expected_foundation_composed_wc_id_maps_object, "Sanity check (no2) that we're still dealing with the same data structure from get_composed_wc_id_maps_object so that following tests are valid")


        function test_helper__get_wcomponent_status_in_knowledge_view (editing_allowed: boolean, wcomponent_id: string)
        {
            return get_wcomponent_status_in_knowledge_view({
                editing_allowed, wcomponent_id, knowledge_view,
                composed_wc_id_maps_object, foundation_composed_wc_id_map: foundation_composed_wc_id_maps_object.composed_wc_id_map,
            })
        }


        let result: WComponentStatusInKnowledgeView
        let expected_result: WComponentStatusInKnowledgeView

        describe("editing_allowed is true", () =>
        {
            const editing_allowed = true


            result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc1")
            expected_result = {
                show_wcomponent_status_in_this_kv_section: true,
                wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                show_add_button: true,
                add_button_text: "Add to current knowledge view",

                show_remove_button: false,
                show_remove_and_block_button: false,
            }
            test(result, expected_result, `with wcomponent not yet added to knowledge view`)


            result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc2")
            expected_result = {
                show_wcomponent_status_in_this_kv_section: false,
                show_add_button: false,

                show_remove_button: true,
                remove_button_text: "Remove from knowledge view",
                remove_button_tooltip: "Remove from current knowledge view (some title of kv1)",

                // No point showing block button when no foundational view
                // containing this wcomponent
                show_remove_and_block_button: false,
            }
            test(result, expected_result, `with normal wcomponent entry in knowledge view`)


            result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc3")
            expected_result = {
                show_wcomponent_status_in_this_kv_section: true,
                wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                show_add_button: true,
                add_button_text: "Add to current knowledge view",

                show_remove_button: false,
                show_remove_and_block_button: false,
            }
            test(result, expected_result, `with wcomponent removed from this knowledge view`)


            result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc4")
            expected_result = {
                show_wcomponent_status_in_this_kv_section: true,
                // Maybe change to "Blocked from appearing in this knowledge view"
                wcomponent_status_in_this_kv_text: "Deleted from this knowledge view",

                show_add_button: true,
                // Maybe change this just to "Add to ..."
                add_button_text: "Re-add to current knowledge view",

                show_remove_button: true,
                remove_button_text: "Remove from knowledge view",
                remove_button_tooltip: "Remove from current knowledge view (some title of kv1)",

                show_remove_and_block_button: false,
            }
            test(result, expected_result, `with wcomponent blocked from this knowledge view`)
        })



        describe("editing_allowed is false", () =>
        {
            const editing_allowed = false


            result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc1")
            expected_result = {
                show_wcomponent_status_in_this_kv_section: true,
                wcomponent_status_in_this_kv_text: "Not present in this knowledge view",
                show_add_button: false,
                show_remove_button: false,
                show_remove_and_block_button: false,
            }
            test(result, expected_result, `with wcomponent not yet added to knowledge view`)


            result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc2")
            expected_result = {
                show_wcomponent_status_in_this_kv_section: false,
                show_add_button: false,
                show_remove_button: false,
                show_remove_and_block_button: false,
            }
            test(result, expected_result, `with normal wcomponent entry in knowledge view`)


            result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc3")
            expected_result = {
                show_wcomponent_status_in_this_kv_section: true,
                wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                show_add_button: false,
                show_remove_button: false,
                show_remove_and_block_button: false,
            }
            test(result, expected_result, `with wcomponent removed from this knowledge view`)


            result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc4")
            expected_result = {
                show_wcomponent_status_in_this_kv_section: true,
                // Maybe change to "Blocked from appearing in this knowledge view"
                wcomponent_status_in_this_kv_text: "Deleted from this knowledge view",

                show_add_button: false,
                show_remove_button: false,
                show_remove_and_block_button: false,
            }
            test(result, expected_result, `with wcomponent blocked from this knowledge view`)
        })
    })



    describe("knowledge view with single knowledge view foundation", () =>
    {

        const foundation_knowledge_view = test_helper__make_knowledge_view({
            // "wc1": never added to this knowledge view
            // "wc2": never added to this knowledge view
            // "wc3": never added to this knowledge view
            // "wc4": never added to this knowledge view

            "wc5":  { left: 50,  top: 222 },
            "wc6":  { left: 60,  top: 222 },
            "wc7":  { left: 70,  top: 222 },
            "wc8":  { left: 80,  top: 222 },

            "wc9":  { left: 90,  top: 222, passthrough: true },
            "wc10": { left: 100, top: 222, passthrough: true },
            "wc11": { left: 110, top: 222, passthrough: true },
            "wc12": { left: 120, top: 222, passthrough: true },

            "wc13": { left: 130, top: 222, blocked: true },
            "wc14": { left: 140, top: 222, blocked: true },
            "wc15": { left: 150, top: 222, blocked: true },
            "wc16": { left: 160, top: 222, blocked: true },
        }, "kv1")


        const knowledge_view = test_helper__make_knowledge_view({
            // "wc1": never yet added to this knowledge view
            "wc2": { left: 20, top: 0 },
            "wc3": { left: 30, top: 0, passthrough: true },
            "wc4": { left: 40, top: 0, blocked: true },

            // "wc5": never added to this knowledge view
            "wc6": { left: 60, top: 0 },
            "wc7": { left: 70, top: 0, passthrough: true },
            "wc8": { left: 80, top: 0, blocked: true },

            // "wc9": never added to this knowledge view
            "wc10": { left: 100, top: 0 },
            "wc11": { left: 110, top: 0, passthrough: true },
            "wc12": { left: 120, top: 0, blocked: true },

            // "wc13": never added to this knowledge view
            "wc14": { left: 140, top: 0 },
            "wc15": { left: 150, top: 0, passthrough: true },
            "wc16": { left: 160, top: 0, blocked: true },
        }, "kv2", foundation_knowledge_view.id)


        const knowledge_views_by_id: KnowledgeViewsById = {
            [foundation_knowledge_view.id]: foundation_knowledge_view,
            [knowledge_view.id]: knowledge_view,
        }


        const knowledge_views_stack = get_foundational_knowledge_views(knowledge_view, knowledge_views_by_id, true)
        const composed_wc_id_maps_object = get_composed_wc_id_maps_object(knowledge_views_stack, {})
        const knowledge_views_foundation_stack = get_foundational_knowledge_views(knowledge_view, knowledge_views_by_id, false)
        const foundation_composed_wc_id_maps_object = get_composed_wc_id_maps_object(knowledge_views_foundation_stack, {})

        const expected_composed_wc_id_maps_object: ComposedWcIdMapsObject =
        {
            composed_wc_id_map:
            {
                // wc1
                "wc2":  { left: 20,  top: 0 },
                // wc3
                // wc4

                "wc5":  { left: 50,  top: 222 },
                "wc6":  { left: 60,  top: 0 },
                "wc7":  { left: 70,  top: 222 },
                // wc8

                // wc9
                "wc10": { left: 100, top: 0 },
                // wc11
                // wc12

                // wc13
                "wc14": { left: 140, top: 0 },
                // wc15
                // wc16
            },
            composed_blocked_wc_id_map:
            {
                // wc1
                // wc2
                // wc3
                "wc4":  { blocked: true, left: 40,  top: 0 },

                // wc5
                // wc6
                // wc7
                "wc8":  { blocked: true, left: 80, top: 0 },

                // wc9
                // wc10
                // wc11
                "wc12": { blocked: true, left: 120, top: 0 },

                "wc13": { blocked: true, left: 130, top: 222 },
                // wc14
                "wc15": { blocked: true, left: 150, top: 222 },
                "wc16": { blocked: true, left: 160, top: 0 },
            },
        }
        test(composed_wc_id_maps_object, expected_composed_wc_id_maps_object, "Sanity check (no3) that we're still dealing with the same data structure from get_composed_wc_id_maps_object so that following tests are valid")


        const expected_foundation_composed_wc_id_maps_object: ComposedWcIdMapsObject =
        {
            composed_wc_id_map: {
                "wc5": { left: 50, top: 222 },
                "wc6": { left: 60, top: 222 },
                "wc7": { left: 70, top: 222 },
                "wc8": { left: 80, top: 222 },
            },
            composed_blocked_wc_id_map: {
                "wc13": { blocked: true, left: 130, top: 222 },
                "wc14": { blocked: true, left: 140, top: 222 },
                "wc15": { blocked: true, left: 150, top: 222 },
                "wc16": { blocked: true, left: 160, top: 222 },
            },
        }
        test(foundation_composed_wc_id_maps_object, expected_foundation_composed_wc_id_maps_object, "Sanity check (no4) that we're still dealing with the same data structure from get_composed_wc_id_maps_object so that following tests are valid")


        function test_helper__get_wcomponent_status_in_knowledge_view (editing_allowed: boolean, wcomponent_id: string)
        {
            return get_wcomponent_status_in_knowledge_view({
                editing_allowed, wcomponent_id, knowledge_view,
                composed_wc_id_maps_object, foundation_composed_wc_id_map: foundation_composed_wc_id_maps_object.composed_wc_id_map,
            })
        }


        let result: WComponentStatusInKnowledgeView
        let expected_result: WComponentStatusInKnowledgeView

        describe("editing_allowed is true", () =>
        {
            const editing_allowed = true

            describe("with wcomponent not yet added to foundational knowledge view", () =>
            {
                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc1")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                    show_add_button: true,
                    add_button_text: "Add to current knowledge view",

                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent not yet added to top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc2")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: false,
                    show_add_button: false,

                    show_remove_button: true,
                    remove_button_text: "Remove from knowledge view",
                    remove_button_tooltip: "Remove from current knowledge view (some title of kv2)",

                    // No point showing block button when no foundational view
                    // containing this wcomponent
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with normal wcomponent entry in top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc3")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                    show_add_button: true,
                    add_button_text: "Add to current knowledge view",

                    show_remove_button: false,

                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent removed from this top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc4")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    // Maybe change to "Blocked from appearing in this knowledge view"
                    wcomponent_status_in_this_kv_text: "Deleted from this knowledge view",

                    show_add_button: true,
                    // Maybe change this just to "Add to ..."
                    add_button_text: "Re-add to current knowledge view",

                    show_remove_button: true,
                    remove_button_text: "Remove from knowledge view",
                    remove_button_tooltip: "Remove from current knowledge view (some title of kv2)",

                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent blocked from this top/current/child knowledge view`)
            })



            describe("with wcomponent added to foundational knowledge view", () =>
            {
                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc5")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view but is present in a foundational knowledge view",

                    show_add_button: true,
                    add_button_text: "Add to current knowledge view",

                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent not yet added to top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc6")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: false,
                    show_add_button: false,

                    show_remove_button: true,
                    remove_button_text: "Remove from knowledge view",
                    remove_button_tooltip: "Remove from current knowledge view (some title of kv2)",

                    // Can show block button when foundational view containing this wcomponent
                    show_remove_and_block_button: true,
                    remove_and_block_button_text: "Remove and Block from knowledge view",
                    remove_and_block_button_tooltip: "Remove and Block from showing in current knowledge view (some title of kv2)",
                }
                test(result, expected_result, `and with normal wcomponent entry in top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc7")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view but is present in a foundational knowledge view",

                    show_add_button: true,
                    add_button_text: "Add to current knowledge view",

                    show_remove_button: false,

                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent removed from this top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc8")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    // Maybe change to "Blocked from appearing in this knowledge view"
                    wcomponent_status_in_this_kv_text: "Deleted from this knowledge view",

                    show_add_button: true,
                    // Maybe change this just to "Add to ..."
                    add_button_text: "Re-add to current knowledge view",

                    show_remove_button: true,
                    remove_button_text: "Remove from knowledge view",
                    remove_button_tooltip: "Remove from current knowledge view (some title of kv2)",

                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent blocked from this top/current/child knowledge view`)
            })



            describe("with wcomponent removed from foundational knowledge view", () =>
            {
                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc9")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                    show_add_button: true,
                    add_button_text: "Add to current knowledge view",

                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent not yet added to top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc10")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: false,
                    show_add_button: false,

                    show_remove_button: true,
                    remove_button_text: "Remove from knowledge view",
                    remove_button_tooltip: "Remove from current knowledge view (some title of kv2)",

                    // No point showing block button when no foundational view
                    // containing this wcomponent
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with normal wcomponent entry in top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc11")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                    show_add_button: true,
                    add_button_text: "Add to current knowledge view",

                    show_remove_button: false,

                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent removed from this top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc12")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    // Maybe change to "Blocked from appearing in this knowledge view"
                    wcomponent_status_in_this_kv_text: "Deleted from this knowledge view",

                    show_add_button: true,
                    // Maybe change this just to "Add to ..."
                    add_button_text: "Re-add to current knowledge view",

                    show_remove_button: true,
                    remove_button_text: "Remove from knowledge view",
                    remove_button_tooltip: "Remove from current knowledge view (some title of kv2)",

                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent blocked from this top/current/child knowledge view`)
            })



            describe("with wcomponent removed and blocked in foundational knowledge view", () =>
            {
                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc13")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                    show_add_button: true,
                    add_button_text: "Add to current knowledge view",

                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent not yet added to top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc14")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: false,
                    show_add_button: false,

                    show_remove_button: true,
                    remove_button_text: "Remove from knowledge view",
                    remove_button_tooltip: "Remove from current knowledge view (some title of kv2)",

                    // No point showing block button when no foundational view
                    // containing this wcomponent
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with normal wcomponent entry in top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc15")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                    show_add_button: true,
                    add_button_text: "Add to current knowledge view",

                    show_remove_button: false,

                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent removed from this top/current/child knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc16")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    // Maybe change to "Blocked from appearing in this knowledge view"
                    wcomponent_status_in_this_kv_text: "Deleted from this knowledge view",

                    show_add_button: true,
                    // Maybe change this just to "Add to ..."
                    add_button_text: "Re-add to current knowledge view",

                    show_remove_button: true,
                    remove_button_text: "Remove from knowledge view",
                    remove_button_tooltip: "Remove from current knowledge view (some title of kv2)",

                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `and with wcomponent blocked from this top/current/child knowledge view`)
            })
        })



        describe("editing_allowed is false", () =>
        {
            const editing_allowed = false


            describe("with wcomponent not yet added to foundational knowledge view", () =>
            {
                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc1")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",
                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent not yet added to knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc2")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: false,
                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with normal wcomponent entry in knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc3")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent removed from this knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc4")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    // Maybe change to "Blocked from appearing in this knowledge view"
                    wcomponent_status_in_this_kv_text: "Deleted from this knowledge view",

                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent blocked from this knowledge view`)
            })



            describe("with wcomponent added to foundational knowledge view", () =>
            {
                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc1")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",
                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent not yet added to knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc2")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: false,
                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with normal wcomponent entry in knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc3")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent removed from this knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc4")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    // Maybe change to "Blocked from appearing in this knowledge view"
                    wcomponent_status_in_this_kv_text: "Deleted from this knowledge view",

                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent blocked from this knowledge view`)
            })



            describe("with wcomponent removed from foundational knowledge view", () =>
            {
                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc1")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",
                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent not yet added to knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc2")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: false,
                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with normal wcomponent entry in knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc3")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent removed from this knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc4")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    // Maybe change to "Blocked from appearing in this knowledge view"
                    wcomponent_status_in_this_kv_text: "Deleted from this knowledge view",

                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent blocked from this knowledge view`)
            })



            describe("with wcomponent removed and blocked in foundational knowledge view", () =>
            {
                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc1")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",
                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent not yet added to knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc2")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: false,
                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with normal wcomponent entry in knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc3")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    wcomponent_status_in_this_kv_text: "Not present in this knowledge view",

                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent removed from this knowledge view`)


                result = test_helper__get_wcomponent_status_in_knowledge_view(editing_allowed, "wc4")
                expected_result = {
                    show_wcomponent_status_in_this_kv_section: true,
                    // Maybe change to "Blocked from appearing in this knowledge view"
                    wcomponent_status_in_this_kv_text: "Deleted from this knowledge view",

                    show_add_button: false,
                    show_remove_button: false,
                    show_remove_and_block_button: false,
                }
                test(result, expected_result, `with wcomponent blocked from this knowledge view`)
            })
        })
    })

}, true)
