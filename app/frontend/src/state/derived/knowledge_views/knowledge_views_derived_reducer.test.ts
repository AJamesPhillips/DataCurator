import { describe, test } from "../../../shared/utils/test"
import { prepare_new_contextless_wcomponent_object } from "../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentConnection, WComponentNode } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { WComponentNodeStateV2 } from "../../../wcomponent/interfaces/state"
import { FilterContextFilters } from "../../filter_context/state"
import { calculate_wc_ids_to_exclude_based_on_filters } from "./knowledge_views_derived_reducer"



export const test_knowledge_views_derived_reducer = describe.delay("knowledge_views_derived_reducer", () =>
{
    describe("calculate_wc_ids_to_exclude_based_on_filters", () =>
    {
        let filters: FilterContextFilters = {
            exclude_by_label_ids: [],
            include_by_label_ids: [],
            exclude_by_component_types: [],
            include_by_component_types: [],
            filter_by_current_knowledge_view: false,
            filter_by_text: "",
        }
        let selected_wc_ids = new Set<string>()

        const node1 = prepare_new_contextless_wcomponent_object({
            id: "node1",
            base_id: -1,
            type: "statev2",
            label_ids: [],
        }) as WComponentNodeStateV2
        const node2 = prepare_new_contextless_wcomponent_object({
            id: "node2",
            base_id: -1,
            type: "statev2",
            label_ids: ["123"],
        }) as WComponentNodeStateV2

        const wcomponent_nodes_on_kv: WComponentNode[] = [
            node1,
            node2,
        ]

        const link1_no_label = prepare_new_contextless_wcomponent_object({
            id: "link1_no_label",
            base_id: -1,
            type: "causal_link",
            label_ids: [],
            from_id: node1.id,
            to_id: node2.id,
        }) as WComponentConnection
        const link2_no_label_no_from = prepare_new_contextless_wcomponent_object({
            id: "link2_no_label_no_from",
            base_id: -1,
            type: "causal_link",
            label_ids: [],
            from_id: node1.id,
            to_id: node2.id,
        }) as WComponentConnection
        const link3_no_label_no_to = prepare_new_contextless_wcomponent_object({
            id: "link3_no_label_no_to",
            base_id: -1,
            type: "causal_link",
            label_ids: [],
            from_id: node1.id,
            to_id: node2.id,
        }) as WComponentConnection
        const link4_has_label = prepare_new_contextless_wcomponent_object({
            id: "link4_has_label",
            base_id: -1,
            type: "causal_link",
            label_ids: ["123"],
            from_id: node1.id,
            to_id: node2.id,
        }) as WComponentConnection
        const link5_has_label_no_from = prepare_new_contextless_wcomponent_object({
            id: "link5_has_label_no_from",
            base_id: -1,
            type: "causal_link",
            label_ids: ["123"],
            from_id: undefined,
            to_id: node2.id,
        }) as WComponentConnection
        const link6_has_label_no_to = prepare_new_contextless_wcomponent_object({
            id: "link6_has_label_no_to",
            base_id: -1,
            type: "causal_link",
            label_ids: ["123"],
            from_id: node2.id,
            to_id: undefined,
        }) as WComponentConnection

        const wcomponent_links_on_kv: WComponentConnection[] = [
            link1_no_label,
            link2_no_label_no_from,
            link3_no_label_no_to,
            link4_has_label,
            link5_has_label_no_from,
            link6_has_label_no_to,
        ]

        let result = calculate_wc_ids_to_exclude_based_on_filters(filters, selected_wc_ids, wcomponent_nodes_on_kv, wcomponent_links_on_kv)
        test(result, new Set(), "no filters")

        filters.include_by_label_ids = ["123"]
        result = calculate_wc_ids_to_exclude_based_on_filters(filters, selected_wc_ids, wcomponent_nodes_on_kv, wcomponent_links_on_kv)
        test(result, new Set([node1.id, link1_no_label.id, link2_no_label_no_from.id, link3_no_label_no_to.id, link4_has_label.id]), "filter out components not labelled")
    })
})
