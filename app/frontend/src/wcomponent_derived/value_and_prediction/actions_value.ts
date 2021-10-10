import { sentence_case } from "../../shared/utils/sentence_case"
import { action_statuses } from "../../wcomponent/interfaces/action"



export const ACTION_OPTIONS = action_statuses.map(status => ({ id: status, title: sentence_case(status) }))
