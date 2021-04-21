import type { Action, AnyAction } from "redux"



interface BulkEditKnowledgeViewEntriesProps
{
    wcomponent_ids: string[],
    change_left: number,
    change_top: number,
}
interface ActionBulkEditKnowledgeViewEntries extends Action, BulkEditKnowledgeViewEntriesProps {}

const bulk_edit_knowledge_view_entries_type = "bulk_edit_knowledge_view_entries"

const bulk_edit_knowledge_view_entries = (args: BulkEditKnowledgeViewEntriesProps): ActionBulkEditKnowledgeViewEntries =>
{
    return { type: bulk_edit_knowledge_view_entries_type, ...args }
}

export const is_bulk_edit_knowledge_view_entries = (action: AnyAction): action is ActionBulkEditKnowledgeViewEntries => {
    return action.type === bulk_edit_knowledge_view_entries_type
}



export const bulk_editing_knowledge_view_entries_actions = {
    bulk_edit_knowledge_view_entries,
}
