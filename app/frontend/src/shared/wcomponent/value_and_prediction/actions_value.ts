import { sentence_case } from "../../utils/sentence_case"
import { ActionStatusType, action_statuses, action_statuses_set } from "../interfaces/action"
import type { StateValueAndPredictionsSet } from "../interfaces/state"



export const ACTION_OPTIONS = action_statuses.map(status => ({ id: status, title: sentence_case(status) }))



function is_valid_action_status (status: string): status is ActionStatusType
{
    return action_statuses_set.has(status as ActionStatusType)
}


export function get_action_status_of_VAP_set (VAP_set: StateValueAndPredictionsSet): ActionStatusType | undefined
{
    let status: ActionStatusType | undefined = undefined

    const conviction = VAP_set.shared_entry_values?.conviction || 0
    const probability = VAP_set.shared_entry_values?.probability || 0

    VAP_set.entries.forEach(VAP =>
    {
        if (Math.max(conviction, VAP.conviction) !== 1) return
        if (Math.max(probability, VAP.probability) !== 1) return
        if (is_valid_action_status(VAP.value)) status = VAP.value
    })

    return status
}
