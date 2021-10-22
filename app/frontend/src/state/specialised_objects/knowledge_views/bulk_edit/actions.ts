import type { Action, AnyAction } from "redux"



interface BulkEditKnowledgeViewEntriesProps
{
    wcomponent_ids: string[]
    change_left: number
    change_top: number
}
export interface ActionBulkEditKnowledgeViewEntries extends Action, BulkEditKnowledgeViewEntriesProps {}

const bulk_edit_knowledge_view_entries_type = "bulk_edit_knowledge_view_entries"

const bulk_edit_knowledge_view_entries = (args: BulkEditKnowledgeViewEntriesProps): ActionBulkEditKnowledgeViewEntries =>
{
    return { type: bulk_edit_knowledge_view_entries_type, ...args }
}

export const is_bulk_edit_knowledge_view_entries = (action: AnyAction): action is ActionBulkEditKnowledgeViewEntries => {
    return action.type === bulk_edit_knowledge_view_entries_type
}



interface SnapToGridKnowledgeViewEntriesProps
{
    wcomponent_ids: string[]
    knowledge_view_id: string
}
export interface ActionSnapToGridKnowledgeViewEntries extends Action, SnapToGridKnowledgeViewEntriesProps {}

const snap_to_grid_knowledge_view_entries_type = "snap_to_grid_knowledge_view_entries"

const snap_to_grid_knowledge_view_entries = (args: SnapToGridKnowledgeViewEntriesProps): ActionSnapToGridKnowledgeViewEntries =>
{
    return { type: snap_to_grid_knowledge_view_entries_type, ...args }
}

export const is_snap_to_grid_knowledge_view_entries = (action: AnyAction): action is ActionSnapToGridKnowledgeViewEntries => {
    return action.type === snap_to_grid_knowledge_view_entries_type
}



interface BulkAddToKnowledgeViewProps
{
    wcomponent_ids: string[]
    knowledge_view_id: string
}
export interface ActionBulkAddToKnowledgeView extends Action, BulkAddToKnowledgeViewProps {}

const bulk_add_to_knowledge_view_type = "bulk_add_to_knowledge_view"

const bulk_add_to_knowledge_view = (args: BulkAddToKnowledgeViewProps): ActionBulkAddToKnowledgeView =>
{
    return { type: bulk_add_to_knowledge_view_type, ...args }
}

export const is_bulk_add_to_knowledge_view = (action: AnyAction): action is ActionBulkAddToKnowledgeView => {
    return action.type === bulk_add_to_knowledge_view_type
}



interface BulkRemoveFromKnowledgeViewProps
{
    wcomponent_ids: string[]
    remove_type: "block" | "passthrough" // Not used yet
}
export interface ActionBulkRemoveFromKnowledgeView extends Action, BulkRemoveFromKnowledgeViewProps {}

const bulk_remove_from_knowledge_view_type = "bulk_remove_from_knowledge_view"

const bulk_remove_from_knowledge_view = (args: BulkRemoveFromKnowledgeViewProps): ActionBulkRemoveFromKnowledgeView =>
{
    return { type: bulk_remove_from_knowledge_view_type, ...args }
}

export const is_bulk_remove_from_knowledge_view = (action: AnyAction): action is ActionBulkRemoveFromKnowledgeView => {
    return action.type === bulk_remove_from_knowledge_view_type
}



export const bulk_editing_knowledge_view_entries_actions = {
    bulk_edit_knowledge_view_entries,
    bulk_add_to_knowledge_view,
    bulk_remove_from_knowledge_view,
    snap_to_grid_knowledge_view_entries,
}
