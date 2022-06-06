import { modify_base } from "../../../supabase/bases"
import type { KnowledgeViewTree } from "../../../supabase/interfaces"
import { ACTIONS } from "../../actions"
import type { NestedKnowledgeViewIds, NestedKnowledgeViewIdsMap } from "../../derived/State"
import { pub_sub } from "../../pub_sub/pub_sub"
import { get_nested_knowledge_view_ids } from "../../specialised_objects/accessors"
import type { RootState } from "../../State"
import type { StoreType } from "../../store"



export async function build_base_knowledge_views_tree_if_absent (store: StoreType)
{
    const state = store.getState()

    const chosen_base = get_chosen_base(state)
    if (!chosen_base) return

    if (chosen_base.knowledge_view_tree)
    {
        // No action needed, we already have a knowledge_view_tree
        return
    }

    const updated_base = {
        ...chosen_base,
        knowledge_view_tree: build_base_knowledge_view_tree(state),
    }

    const res = await modify_base(updated_base)
    if (res.error)
    {
        console.error(`Error modifying base: "${updated_base.id}"`, res.error)
        return
    }

    pub_sub.user.pub("stale_bases", false)
}



function get_chosen_base (state: RootState)
{
    const { bases_by_id, chosen_base_id } = state.user_info

    // Defensive
    if (!bases_by_id)
    {
        console.error("No state.user_info.bases_by_id present when build_base_knowledge_views_tree_if_absent")
        return
    }

    // Defensive
    if (chosen_base_id === undefined)
    {
        console.error("No state.user_info.chosen_base_id present when build_base_knowledge_views_tree_if_absent")
        return
    }

    const chosen_base = bases_by_id[chosen_base_id]
    // Defensive
    if (chosen_base === undefined)
    {
        console.error("No chosen_base present when build_base_knowledge_views_tree_if_absent")
        return
    }

    return chosen_base
}



function build_base_knowledge_view_tree (state: RootState): KnowledgeViewTree | undefined
{
    const knowledge_views = Object.values(state.specialised_objects.knowledge_views_by_id)
    const { chosen_base_id } = state.user_info

    const nested_knowledge_view_ids = get_nested_knowledge_view_ids(knowledge_views, chosen_base_id)

    return convert_nested_knowledge_view_ids_to_simple_tree(nested_knowledge_view_ids)
}



export function convert_nested_knowledge_view_ids_to_simple_tree ({ top_ids, map }: NestedKnowledgeViewIds): KnowledgeViewTree | undefined
{
    return _convert_nested_knowledge_view_ids_to_simple_tree(top_ids, map)
}

function _convert_nested_knowledge_view_ids_to_simple_tree (ids: string[], map: NestedKnowledgeViewIdsMap): KnowledgeViewTree | undefined
{
    if (ids.length === 0) return undefined

    const tree: KnowledgeViewTree = {}

    ids.forEach(id =>
    {
        const entry = map[id]
        // Defensive
        if (!entry)
        {
            console.error(`No entry found for kv id: "${id}" in NestedKnowledgeViewIds map`)
            return
        }

        tree[id] = {
            sort_type: entry.sort_type,
            children: _convert_nested_knowledge_view_ids_to_simple_tree(entry.child_ids, map)
        }
    })

    return tree
}
