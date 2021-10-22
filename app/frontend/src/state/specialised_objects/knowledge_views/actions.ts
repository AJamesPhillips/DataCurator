import type { Action, AnyAction } from "redux"

import type {
    KnowledgeViewWComponentEntry,
    KnowledgeView,
} from "../../../shared/interfaces/knowledge_view"
import { bulk_editing_knowledge_view_entries_actions } from "./bulk_edit/actions"



interface UpsertWComponentKnowledgeViewEntryArgs
{
    wcomponent_id: string
    knowledge_view_id: string
    entry: KnowledgeViewWComponentEntry
}
interface ActionUpsertWComponentKnowledgeViewEntry extends Action, UpsertWComponentKnowledgeViewEntryArgs {}

const upsert_knowledge_view_entry_type = "upsert_knowledge_view_entry"

const upsert_knowledge_view_entry = (args: UpsertWComponentKnowledgeViewEntryArgs): ActionUpsertWComponentKnowledgeViewEntry =>
    ({ type: upsert_knowledge_view_entry_type, ...args })

export const is_upsert_knowledge_view_entry = (action: AnyAction): action is ActionUpsertWComponentKnowledgeViewEntry => {
    return action.type === upsert_knowledge_view_entry_type
}



interface UpsertKnowledgeViewArgs
{
    knowledge_view: KnowledgeView
    source_of_truth?: boolean
}
interface ActionUpsertKnowledgeView extends Action, UpsertKnowledgeViewArgs {}

const upsert_knowledge_view_type = "upsert_knowledge_view"

const upsert_knowledge_view = (args: UpsertKnowledgeViewArgs): ActionUpsertKnowledgeView =>
    ({ type: upsert_knowledge_view_type, ...args })

export const is_upsert_knowledge_view = (action: AnyAction): action is ActionUpsertKnowledgeView => {
    return action.type === upsert_knowledge_view_type
}



export const knowledge_view_actions = {
    upsert_knowledge_view_entry,
    upsert_knowledge_view,
    ...bulk_editing_knowledge_view_entries_actions,
}
