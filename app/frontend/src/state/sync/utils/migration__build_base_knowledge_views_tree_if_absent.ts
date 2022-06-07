import type { KnowledgeView } from "../../../shared/interfaces/knowledge_view"
import { is_defined } from "../../../shared/utils/is_defined"
import { modify_base } from "../../../supabase/bases"
import type { KnowledgeViewTree } from "../../../supabase/interfaces"
import { pub_sub } from "../../pub_sub/pub_sub"
import type { RootState } from "../../State"
import type { StoreType } from "../../store"
import { selector_chosen_base } from "../../user_info/selector"



export async function migration__build_base_knowledge_views_tree_if_absent (store: StoreType)
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



function build_base_knowledge_view_tree (state: RootState): KnowledgeViewTree
{
    const knowledge_views = Object.values(state.specialised_objects.knowledge_views_by_id)
    const { chosen_base_id } = state.user_info

    return get_knowledge_view_tree_from_knowledge_views(knowledge_views, chosen_base_id)
}



interface KnowledgeViewWithParentId extends KnowledgeView
{
    parent_knowledge_view_id: string
}


function get_knowledge_view_tree_from_knowledge_views (knowledge_views: KnowledgeView[], chosen_base_id: number | undefined): KnowledgeViewTree
{
    const map: KnowledgeViewTree = {}

    let potential_children: KnowledgeViewWithParentId[] = []
    knowledge_views.forEach(kv =>
    {
        const { parent_knowledge_view_id, sort_type = "normal" } = kv
        if (parent_knowledge_view_id)
        {
            potential_children.push({ ...kv, parent_knowledge_view_id })
        }
        else if (kv.base_id === chosen_base_id)
        {
            map[kv.id] = { sort_type, children: undefined }
        }
        else
        {
            // Skip it as it's from another base with no parent
        }
    })

    potential_children = add_child_views(potential_children, map)

    const kvs_only_this_base = potential_children.filter(child => child.base_id === chosen_base_id)
    const potentially_orphaned_kv_ids = new Set(kvs_only_this_base.map(orphan => orphan.id))
    const orphaned = kvs_only_this_base.filter(kv_from_this_base => !potentially_orphaned_kv_ids.has(kv_from_this_base.parent_knowledge_view_id))

    // Add orphaned views
    orphaned.forEach(orphan => map[orphan.id] = { sort_type: "errored", children: undefined })
    const orphaned_kv_ids = new Set(orphaned.map(orphan => orphan.id))

    potential_children = potential_children.filter(kv_from_any_base => !orphaned_kv_ids.has(kv_from_any_base.parent_knowledge_view_id))

    // With orphaned views now added perhaps these potential children should be addable
    potential_children = add_child_views(potential_children, map)

    // Ignore the remaining potential_children.  Do not add as orphans as they should only
    // be from other bases now
    // potential_children.forEach(orphan => map[orphan.id] = { sort_type: "errored", children: undefined })

    return map
}



function add_child_views (potential_children: KnowledgeViewWithParentId[], map: KnowledgeViewTree)
{
    potential_children = potential_children.filter(potential_child =>
    {
        const parent_kv_tree_entry = map[potential_child.parent_knowledge_view_id]
        if (parent_kv_tree_entry)
        {
            const children = parent_kv_tree_entry.children || {}

            const { id, sort_type = "normal" } = potential_child
            children[id] = { sort_type, children: undefined }
            parent_kv_tree_entry.children = children

            return false
        }
        else return true
    })

    const children_maps = Object.values(map).map(entry => entry.children).filter(is_defined)

    children_maps.forEach(children =>
    {
        potential_children = add_child_views(potential_children, children)
    })

    return potential_children
}
