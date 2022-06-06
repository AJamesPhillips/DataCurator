import { modify_base } from "../../../supabase/bases"
import type { KnowledgeViewTree } from "../../../supabase/interfaces"
import type { NestedKnowledgeViewIds, NestedKnowledgeViewIdsMap } from "../../derived/State"
import { pub_sub } from "../../pub_sub/pub_sub"
import { get_nested_knowledge_view_ids } from "../../specialised_objects/accessors"
import type { RootState } from "../../State"
import type { StoreType } from "../../store"
import { selector_chosen_base } from "../../user_info/selector"



export async function build_base_knowledge_views_tree_if_absent (store: StoreType)
{
    const state = store.getState()

    const chosen_base = selector_chosen_base(state, " during build_base_knowledge_views_tree_if_absent")
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



function build_base_knowledge_view_tree (state: RootState): KnowledgeViewTree | undefined
{
    const knowledge_views = Object.values(state.specialised_objects.knowledge_views_by_id)
    const { chosen_base_id } = state.user_info

    const nested_knowledge_view_ids = get_nested_knowledge_view_ids(knowledge_views, chosen_base_id)

    return convert_nested_knowledge_view_ids_to_simple_tree(nested_knowledge_view_ids)
}



function convert_nested_knowledge_view_ids_to_simple_tree ({ top_ids, map }: NestedKnowledgeViewIds): KnowledgeViewTree | undefined
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
