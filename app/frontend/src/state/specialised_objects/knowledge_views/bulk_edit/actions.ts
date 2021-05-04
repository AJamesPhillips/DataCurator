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



interface BulkAddToKnowledgeViewProps
{
    knowledge_view_id: string
    wcomponent_ids: string[],
}
interface ActionBulkAddToKnowledgeView extends Action, BulkAddToKnowledgeViewProps {}

const bulk_add_to_knowledge_view_type = "bulk_add_to_knowledge_view"

const bulk_add_to_knowledge_view = (args: BulkAddToKnowledgeViewProps): ActionBulkAddToKnowledgeView =>
{
    return { type: bulk_add_to_knowledge_view_type, ...args }
}

export const is_bulk_add_to_knowledge_view = (action: AnyAction): action is ActionBulkAddToKnowledgeView => {
    return action.type === bulk_add_to_knowledge_view_type
}


export const bulk_editing_knowledge_view_entries_actions = {
    bulk_edit_knowledge_view_entries,
    bulk_add_to_knowledge_view,
}
