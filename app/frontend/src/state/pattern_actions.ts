import type { Action, AnyAction } from "redux"

import { get_datetime, get_new_pattern_id } from "../utils/utils"
import type { Pattern, PatternAttribute } from "./State"


//

interface ActionAddPattern extends Action, Pattern {}

const add_pattern_type = "add_pattern"


interface AddPatternArgs
{
    name: string
    content: string
    attributes: PatternAttribute[]
}
const add_pattern = (args: AddPatternArgs): ActionAddPattern =>
{
    const id = get_new_pattern_id()
    const datetime_created = get_datetime()

    return {
        type: add_pattern_type,
        id,
        datetime_created,
        name: args.name,
        content: args.content,
        attributes: args.attributes,
    }
}

export const is_add_pattern = (action: AnyAction): action is ActionAddPattern => {
    return action.type === add_pattern_type
}


//

interface ActionUpdatePattern extends Action {
    id: string
    name: string
    content: string
}

const update_pattern_type = "update_pattern"


interface UpdatePatternArgs
{
    id: string
    name: string
    content: string
}
const update_pattern = (args: UpdatePatternArgs): ActionUpdatePattern =>
{
    return {
        type: update_pattern_type,
        id: args.id,
        name: args.name,
        content: args.content,
    }
}

export const is_update_pattern = (action: AnyAction): action is ActionUpdatePattern => {
    return action.type === update_pattern_type
}


//

interface ActionDeletePattern extends Action {
    id: string
}

const delete_pattern_type = "delete_pattern"

const delete_pattern = (id: string): ActionDeletePattern =>
{
    return { type: delete_pattern_type, id }
}

export const is_delete_pattern = (action: AnyAction): action is ActionDeletePattern => {
    return action.type === delete_pattern_type
}


//

interface ActionReplaceAllPatterns extends Action {
    patterns: Pattern[]
}

const replace_all_patterns_type = "replace_all_patterns"


interface ReplaceAllPatternsProps
{
    patterns: Pattern[]
}
const replace_all_patterns = (args: ReplaceAllPatternsProps): ActionReplaceAllPatterns =>
{
    return {
        type: replace_all_patterns_type,
        patterns: args.patterns,
    }
}

export const is_replace_all_patterns = (action: AnyAction): action is ActionReplaceAllPatterns => {
    return action.type === replace_all_patterns_type
}


//

export const pattern_actions = {
    add_pattern,
    update_pattern,
    delete_pattern,
    replace_all_patterns,
}
