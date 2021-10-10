import type { Action, AnyAction } from "redux"

import type { Perception } from "../../../wcomponent/interfaces/SpecialisedObjects"



interface UpsertPerceptionArgs
{
    perception: Perception
    add_to_knowledge_view_id?: string
}
interface ActionUpsertPerception extends Action, UpsertPerceptionArgs {}

const upsert_perception_type = "upsert_perception"

const upsert_perception = (args: UpsertPerceptionArgs): ActionUpsertPerception =>
    ({ type: upsert_perception_type, ...args })

export const is_upsert_perception = (action: AnyAction): action is ActionUpsertPerception => {
    return action.type === upsert_perception_type
}



interface DeletePerceptionArgs
{
    perception_id: string
}
interface ActionDeletePerception extends Action, DeletePerceptionArgs {}

const delete_perception_type = "delete_perception"

const delete_perception = (args: DeletePerceptionArgs): ActionDeletePerception =>
    ({ type: delete_perception_type, ...args })

export const is_delete_perception = (action: AnyAction): action is ActionDeletePerception => {
    return action.type === delete_perception_type
}



export const perception_actions = {
    upsert_perception,
    delete_perception,
}
