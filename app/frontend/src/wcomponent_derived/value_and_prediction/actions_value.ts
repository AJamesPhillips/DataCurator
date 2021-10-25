import { ACTION_VALUE_POSSIBILITY_IDS, VALUE_POSSIBILITY_IDS_to_text } from "../../wcomponent/value/parse_value"



export const ACTION_OPTIONS = ACTION_VALUE_POSSIBILITY_IDS.map(id => ({ id, title: VALUE_POSSIBILITY_IDS_to_text[id] || "?" }))
