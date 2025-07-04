import { describe, test } from "datacurator-core/utils/test"
import { get_new_knowledge_view_object } from "../../../knowledge_view/create_new_knowledge_view"
import type { KnowledgeView, KnowledgeViewWComponentIdEntryMap } from "../../../shared/interfaces/knowledge_view"
import { FieldMergerReturn, get_default_field_merger, merge_base_object, MergeDataCoreArgs, MergeDataReturn } from "./merge_data"



export function merge_knowledge_view (args: MergeDataCoreArgs<KnowledgeView>): MergeDataReturn<KnowledgeView>
{

    return merge_base_object({ ...args, get_custom_field_merger })
}



function get_custom_field_merger <U extends KnowledgeView, T extends keyof KnowledgeView> (field: T)
{
    if (field !== "wc_id_map") return undefined


    function are_equal (a: KnowledgeViewWComponentIdEntryMap, b: KnowledgeViewWComponentIdEntryMap)
    {
        return JSON.stringify(a) === JSON.stringify(b)
    }


    return (args: MergeDataCoreArgs<U>): FieldMergerReturn<KnowledgeView, T> =>
    {
        const source_of_truth_value = args.source_of_truth_value.wc_id_map
        const current_value = args.current_value.wc_id_map
        const last_source_of_truth_value = args.last_source_of_truth_value.wc_id_map


        let needs_save = false
        let unresolvable_conflict = false
        let value: KnowledgeViewWComponentIdEntryMap


        if (args.update_successful || are_equal(source_of_truth_value, last_source_of_truth_value))
        {
            value = current_value
            needs_save = !are_equal(current_value, source_of_truth_value)
        }
        else
        {
            value = source_of_truth_value
            if (!are_equal(current_value, last_source_of_truth_value))
            {
                const wc_ids = Array.from(new Set(Object.keys(current_value).concat(Object.keys(source_of_truth_value))))

                wc_ids.forEach(wc_id =>
                {
                    const merge = get_default_field_merger<KnowledgeViewWComponentIdEntryMap, string>(wc_id)({
                        source_of_truth_value,
                        current_value: current_value,
                        last_source_of_truth_value,
                        update_successful: args.update_successful,
                    })
                    value[wc_id] = merge.value

                    if (merge.unresolvable_conflict)
                    {
                        console .debug("unresolvable_conflict in wc_id_map with wc_id: ", wc_id, "last_source_of_truth_value", last_source_of_truth_value[wc_id], "source_of_truth_value", source_of_truth_value[wc_id], "current_value", current_value[wc_id])
                    }

                    needs_save = needs_save || merge.needs_save
                    unresolvable_conflict = unresolvable_conflict || merge.unresolvable_conflict
                })
            }
        }

        return { needs_save, unresolvable_conflict, value: value as any }
    }
}



export const test_merge_knowledge_views = describe.delay("merge knowledge view functions", () =>
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

    const e = (position: number) => ({ left: position, top: position })


    describe("should handle adding entry on client", () =>
    {
        const last_source_of_truth_value: KnowledgeView = get_new_knowledge_view_object({
            wc_id_map: {}, modified_at: dt1, base_id: 0,
        })
        const current_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(1) }, needs_save: true, saving: true }
        const source_of_truth_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(1) }, modified_at: latest_modified_at }

        const merge = merge_knowledge_view({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: true, // 200
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.wc_id_map, { 0: e(1) })

        test(merge.needs_save, false)
        test(merge.unresolvable_conflicted_fields, [])
    })



    describe("should handle adding entries on client and remote", () =>
    {
        const last_source_of_truth_value: KnowledgeView = get_new_knowledge_view_object({
            wc_id_map: {}, modified_at: dt1, base_id: 0,
        })
        const current_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(1) }, needs_save: true, saving: true }
        const source_of_truth_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 2: e(3) }, modified_at: latest_modified_at }

        const merge = merge_knowledge_view({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.wc_id_map, { 0: e(1), 2: e(3) })

        test(merge.needs_save, true)
        test(merge.unresolvable_conflicted_fields, [])
    })



    describe("should handle nonconflicting changing different entries on client and remote", () =>
    {
        const last_source_of_truth_value: KnowledgeView = get_new_knowledge_view_object({
            wc_id_map: { 0: e(1), 2: e(3) }, modified_at: dt1, base_id: 0,
        })
        const current_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(4), 2: e(3) }, needs_save: true, saving: true }
        const source_of_truth_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(1), 2: e(5) }, modified_at: latest_modified_at }

        const merge = merge_knowledge_view({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.wc_id_map, { 0: e(4), 2: e(5) })

        test(merge.needs_save, true)
        test(merge.unresolvable_conflicted_fields, [])
    })



    describe("should handle conflict changing same entries on client and remote", () =>
    {
        const last_source_of_truth_value: KnowledgeView = get_new_knowledge_view_object({
            wc_id_map: { 0: e(1) }, modified_at: dt1, base_id: 0,
        })
        const current_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(3) }, needs_save: true, saving: true }
        const source_of_truth_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(2) }, modified_at: latest_modified_at }

        const merge = merge_knowledge_view({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.wc_id_map, { 0: e(2) })

        test(merge.needs_save, false)
        test(merge.unresolvable_conflicted_fields, ["wc_id_map"])
    })



    describe("should handle resolveable conflict changing same entries on client and remote", () =>
    {
        const last_source_of_truth_value: KnowledgeView = get_new_knowledge_view_object({
            wc_id_map: { 0: e(1) }, modified_at: dt1, base_id: 0,
        })
        const current_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(2) }, needs_save: true, saving: true }
        const source_of_truth_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(2) }, modified_at: latest_modified_at }

        const merge = merge_knowledge_view({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.wc_id_map, { 0: e(2) })

        test(merge.needs_save, false)
        test(merge.unresolvable_conflicted_fields, [])
    })



    describe("should handle non and conflict changes and second client change", () =>
    {
        const last_source_of_truth_value: KnowledgeView = get_new_knowledge_view_object({
            wc_id_map: { 0: e(1) }, modified_at: dt1, base_id: 0,
        })
        // The user changes the position the first time
        const current_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(4), 1: e(10) }, needs_save: true, saving: true }
        const source_of_truth_value: KnowledgeView = { ...last_source_of_truth_value, wc_id_map: { 0: e(2) }, modified_at: latest_modified_at }

        const merge = merge_knowledge_view({
            last_source_of_truth_value,
            current_value,
            source_of_truth_value,
            update_successful: false, // 409
        })

        test(dt_ms(merge.value.modified_at), dt_ms(latest_modified_at))
        test(merge.value.wc_id_map, { 0: e(2), 1: e(10) })

        test(merge.needs_save, true)
        test(merge.unresolvable_conflicted_fields, ["wc_id_map"])
    })


})
