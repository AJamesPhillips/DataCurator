import type { Pattern } from "../../../state/State"
import { PATTERN_ID_ACTION_V2, PATTERN_ID_PRIORITY, PATTERN_ID_EVENT } from "../_common"
import { transform_airtable_action } from "./transform_airtable_action"
import { transform_airtable_event } from "./transform_airtable_event"
import { transform_airtable_priority } from "./transform_airtable_priority"



export function get_transformation_function (pattern: Pattern)
{
    if (pattern.id === PATTERN_ID_ACTION_V2)
    {
        return transform_airtable_action
    }
    else if (pattern.id === PATTERN_ID_PRIORITY)
    {
        return transform_airtable_priority
    }
    else if (pattern.id === PATTERN_ID_EVENT)
    {
        return transform_airtable_event
    }

    return undefined
}
