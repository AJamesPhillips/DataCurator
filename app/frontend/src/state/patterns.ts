import type { AnyAction } from "redux"
import { replace_element } from "../utils/list"

import { is_add_pattern, is_update_pattern, is_delete_pattern, is_replace_all_patterns } from "./pattern_actions"
import type { RootState, Pattern } from "./State"


export const patterns_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_add_pattern(action))
    {
        const new_pattern: Pattern = {
            id: action.id,
            datetime_created: action.datetime_created,
            name: action.name,
            content: action.content,
            attributes: action.attributes,
        }

        state = {
            ...state,
            patterns: [...state.patterns, new_pattern]
        }
    }


    if (is_update_pattern(action))
    {
        const pattern = state.patterns.find(({ id }) => id === action.id)

        if (!pattern)
        {
            console.error(`No pattern for id: "${action.id}"`)
            return state
        }

        const replacement_pattern: Pattern = {
            ...pattern,
            name: action.name,
            content: action.content,
        }

        const patterns = replace_element(state.patterns, replacement_pattern, ({ id }) => id === action.id)

        state = {
            ...state,
            patterns
        }
    }


    if (is_delete_pattern(action))
    {
        state = {
            ...state,
            patterns: state.patterns.filter(({ id }) => id !== action.id)
        }
    }


    if (is_replace_all_patterns(action))
    {
        state = {
            ...state,
            patterns: action.patterns
        }
    }

    return state
}
