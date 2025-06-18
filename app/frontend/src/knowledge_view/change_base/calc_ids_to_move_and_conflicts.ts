import { describe, test } from "datacurator-core/utils/test"
import type { KnowledgeView, KnowledgeViewsById } from "../../shared/interfaces/knowledge_view"
import type { NestedKnowledgeViewIdsMap } from "../../state/derived/State"
import { get_nested_knowledge_view_ids } from "../../state/specialised_objects/accessors"
import { prepare_new_contextless_wcomponent_object } from "../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import type { WComponent, WComponentsById } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_new_knowledge_view_object } from "../create_new_knowledge_view"



interface CalcIdsToMoveAndConflictsArgs
{
    root_knowledge_view_id_to_move: string
    nested_knowledge_view_ids_map: NestedKnowledgeViewIdsMap
    knowledge_views_by_id: KnowledgeViewsById
    wcomponents_by_id: WComponentsById
}
export function calc_ids_to_move_and_conflicts (args: CalcIdsToMoveAndConflictsArgs)
{
    const { knowledge_views_by_id, wcomponents_by_id } = args

    const knowledge_views_to_move = get_knowledge_views_to_move(args)
    const kv_ids_to_move = new Set(knowledge_views_to_move.map(kv => kv.id))
    const knowledge_views_to_keep = get_knowledge_views_to_keep({ kv_ids_to_move, knowledge_views_by_id })
    const { wc_ids_to_move, wcomponents_move_conflicts } = get_possible_wc_ids_to_move({ knowledge_views_to_move, knowledge_views_to_keep, wcomponents_by_id })


    return { kv_ids_to_move, wc_ids_to_move, wcomponents_move_conflicts }
}



interface GetKnowledgeViewsToMoveArgs
{
    root_knowledge_view_id_to_move: string
    nested_knowledge_view_ids_map: NestedKnowledgeViewIdsMap
    knowledge_views_by_id: KnowledgeViewsById
}
function get_knowledge_views_to_move (args: GetKnowledgeViewsToMoveArgs)
{
    const knowledge_views_to_move: KnowledgeView[] = []
    const knowledge_view_ids_to_move = new Set<string>()

    const knowledge_view_ids_to_assess = [args.root_knowledge_view_id_to_move]
    while (knowledge_view_ids_to_assess.length)
    {
        const knowledge_view_id_to_assess = knowledge_view_ids_to_assess.pop()
        if (!knowledge_view_id_to_assess) break

        // Protects against circular references in nested map
        if (knowledge_view_ids_to_move.has(knowledge_view_id_to_assess)) continue

        const kv = args.knowledge_views_by_id[knowledge_view_id_to_assess]
        const entry = args.nested_knowledge_view_ids_map[knowledge_view_id_to_assess]
        if (!entry || !kv)
        {
            const kv_present = kv ? "present" : "absent"
            const nested_kv_entry_present = entry ? "present" : "absent"
            console.error(`kv of id: "${knowledge_view_id_to_assess}" kv is "${kv_present}" but nested kv map entry is "${nested_kv_entry_present}"`)
            continue
        }

        knowledge_views_to_move.push(kv)
        knowledge_view_ids_to_move.add(knowledge_view_id_to_assess)
        entry.child_ids.forEach(id => knowledge_view_ids_to_assess.push(id))
    }

    return knowledge_views_to_move
}



interface GetKnowledgeViewsToKeepArgs
{
    kv_ids_to_move: Set<string>
    knowledge_views_by_id: KnowledgeViewsById
}
function get_knowledge_views_to_keep (args: GetKnowledgeViewsToKeepArgs)
{
    return Object.values(args.knowledge_views_by_id).filter(kv => !args.kv_ids_to_move.has(kv.id))
}



interface GetPossibleWComponentIdsToMoveArgs
{
    knowledge_views_to_move: KnowledgeView[]
    knowledge_views_to_keep: KnowledgeView[]
    wcomponents_by_id: WComponentsById
}
interface WComponentConflictKVEntry
{
    kv_id: string
    left: number
    top: number
}
export interface WComponentMoveBaseConflicts { [wc_id: string]: WComponentConflictKVEntry[] }
function get_possible_wc_ids_to_move (args: GetPossibleWComponentIdsToMoveArgs)
{
    const wc_ids_in_kvs_to_keep: WComponentMoveBaseConflicts = {}
    args.knowledge_views_to_keep.forEach(kv =>
    {
        Object.entries(kv.wc_id_map).forEach(([wc_id, kv_entry]) =>
        {
            if (kv_entry.blocked || kv_entry.passthrough) return

            const kv_ids = wc_ids_in_kvs_to_keep[wc_id] || []
            kv_ids.push({ kv_id: kv.id, left: kv_entry.left, top: kv_entry.top })
            wc_ids_in_kvs_to_keep[wc_id] = kv_ids
        })
    })


    const kv_ids_to_keep = new Set(args.knowledge_views_to_keep.map(kv => kv.id))
    const kv_ids_to_move = new Set(args.knowledge_views_to_move.map(kv => kv.id))


    const wc_ids_to_move = new Set<string>()
    const wcomponents_move_conflicts: WComponentMoveBaseConflicts = {}

    args.knowledge_views_to_move.forEach(kv => Object.entries(kv.wc_id_map).forEach(([wc_id, kv_entry]) =>
    {
        // for now, leave behind any wcomponents that have been deleted and aren't present in another knowledge_views_to_move
        if (kv_entry.blocked || kv_entry.passthrough) return

        // probably belongs to another base (project)
        if (!args.wcomponents_by_id[wc_id]) return

        // Do not move any component which has a view that is being kept
        if (kv_ids_to_keep.has(wc_id)) return

        const conflicts = wc_ids_in_kvs_to_keep[wc_id]
        const must_move = kv_ids_to_move.has(wc_id)
        if (conflicts && !must_move)
        {
            wcomponents_move_conflicts[wc_id] = conflicts
        }
        else
        {
            wc_ids_to_move.add(wc_id)
        }
    }))

    return { wc_ids_to_move, wcomponents_move_conflicts }
}



export const test_calc_ids_to_move_and_conflicts_functions = describe.delay("calc_ids_to_move_and_conflicts", () =>
{
    const base_id = 1


    // Create knowledge views
    const kv_A = get_new_knowledge_view_object({ id: "uuid A", base_id, title: "A" })
    const kv_B = get_new_knowledge_view_object({ id: "uuid B", base_id, title: "B", parent_knowledge_view_id: kv_A.id })
    const kv_C = get_new_knowledge_view_object({ id: "uuid C", base_id, title: "C", parent_knowledge_view_id: kv_B.id })
    const kv_I = get_new_knowledge_view_object({ id: "uuid I", base_id, title: "I", parent_knowledge_view_id: kv_B.id })
    const kv_J = get_new_knowledge_view_object({ id: "uuid J", base_id, title: "J", parent_knowledge_view_id: kv_A.id })
    const knowledge_views: KnowledgeView[] = [ kv_A, kv_B, kv_C, kv_I, kv_J ]

    const knowledge_views_by_id: KnowledgeViewsById = {}
    knowledge_views.forEach(kv => knowledge_views_by_id[kv.id] = kv)


    // Create wcomponents
    const wcomponents_by_id: WComponentsById = {}
    const add_wc = (wc: WComponent) => { wcomponents_by_id[wc.id] = wc; return wc }

    // Create wcomponents for knowledge views
    const wc_A = add_wc(prepare_new_contextless_wcomponent_object({ base_id, title: kv_A.title, id: kv_A.id }))
    const wc_B = add_wc(prepare_new_contextless_wcomponent_object({ base_id, title: kv_B.title, id: kv_B.id }))
    const wc_C = add_wc(prepare_new_contextless_wcomponent_object({ base_id, title: kv_C.title, id: kv_C.id }))
    const wc_I = add_wc(prepare_new_contextless_wcomponent_object({ base_id, title: kv_I.title, id: kv_I.id }))
    const wc_J = add_wc(prepare_new_contextless_wcomponent_object({ base_id, title: kv_J.title, id: kv_J.id }))

    // Create wcomponents without knowledge views
    const wc_E = add_wc(prepare_new_contextless_wcomponent_object({ id: "uuid E", base_id, title: "E" }))
    const wc_F = add_wc(prepare_new_contextless_wcomponent_object({ id: "uuid F", base_id, title: "F" }))
    const wc_G = add_wc(prepare_new_contextless_wcomponent_object({ id: "uuid G", base_id, title: "G" }))
    const wc_H = add_wc(prepare_new_contextless_wcomponent_object({ id: "uuid H", base_id, title: "H" }))


    // Add wcomponents to knowledge views
    kv_A.wc_id_map[wc_A.id] = { left: 0, top: 0 }
    kv_A.wc_id_map[wc_B.id] = { left: 0, top: 0 }
    kv_A.wc_id_map[wc_E.id] = { left: 0, top: 0 }
    kv_A.wc_id_map[wc_F.id] = { left: 0, top: 0 }
    kv_A.wc_id_map[wc_I.id] = { left: 0, top: 0 }
    kv_A.wc_id_map[wc_J.id] = { left: 0, top: 0 }

    kv_B.wc_id_map[wc_B.id] = { left: 0, top: 0 }
    kv_B.wc_id_map[wc_C.id] = { left: 0, top: 0 }
    kv_B.wc_id_map[wc_E.id] = { left: 0, top: 0 }
    kv_B.wc_id_map[wc_G.id] = { left: 0, top: 0 }
    kv_B.wc_id_map[wc_I.id] = { left: 0, top: 0 }

    kv_C.wc_id_map[wc_C.id] = { left: 0, top: 0 }
    kv_C.wc_id_map[wc_F.id] = { left: 0, top: 0 }
    kv_C.wc_id_map[wc_H.id] = { left: 0, top: 0 }
    kv_C.wc_id_map[wc_J.id] = { left: 0, top: 0 }

    kv_I.wc_id_map[wc_I.id] = { left: 0, top: 0 }

    kv_J.wc_id_map[wc_J.id] = { left: 0, top: 0 }


    const nested_knowledge_view_ids_map: NestedKnowledgeViewIdsMap = get_nested_knowledge_view_ids(knowledge_views, base_id).map

    const result = calc_ids_to_move_and_conflicts({
        root_knowledge_view_id_to_move: kv_B.id,
        nested_knowledge_view_ids_map,
        knowledge_views_by_id,
        wcomponents_by_id,
    })


    // These tests mirror the design_notes/changing_base_of_wc_and_kv
    test(result.kv_ids_to_move, new Set([kv_B.id, kv_C.id, kv_I.id]))
    test(result.wc_ids_to_move, new Set([wc_B.id, wc_C.id, wc_I.id, wc_G.id, wc_H.id]))
    test(Object.keys(result.wcomponents_move_conflicts), [wc_E.id, wc_F.id])

})
