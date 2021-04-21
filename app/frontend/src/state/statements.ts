import type { Action, AnyAction } from "redux"

import { get_datetime, get_new_statement_id } from "../utils/utils"
import type { RootState, Statement } from "./State"


export const statements_reducer = (state: RootState, action: AnyAction): RootState =>
{
    if (is_add_statement(action))
    {
        const new_statement: Statement = {
            id: action.id,
            content: action.content,
            datetime_created: action.datetime_created,
            labels: action.labels,
        }

        state = {
            ...state,
            statements: [...state.statements, new_statement]
        }
    }

    if (is_delete_statement(action))
    {
        state = {
            ...state,
            statements: state.statements.filter(({ id }) => id !== action.id)
        }
    }

    if (is_replace_all_statements(action))
    {
        state = {
            ...state,
            statements: action.statements
        }
    }

    return state
}


//

interface ActionAddStatement extends Action, Statement {}

const add_statement_type = "add_statement"


interface AddStatementProps
{
    content: string
    labels: string[]
}
const add_statement = (args: AddStatementProps): ActionAddStatement =>
{
    const datetime_created = get_datetime()
    const id = get_new_statement_id()

    return {
        type: add_statement_type,
        id,
        datetime_created,
        content: args.content,
        labels: args.labels,
    }
}

const is_add_statement = (action: AnyAction): action is ActionAddStatement => {
    return action.type === add_statement_type
}


//

interface ActionDeleteStatement extends Action {
    id: string
}

const delete_statement_type = "delete_statement"

const delete_statement = (id: string): ActionDeleteStatement =>
{
    return { type: delete_statement_type, id }
}

const is_delete_statement = (action: AnyAction): action is ActionDeleteStatement => {
    return action.type === delete_statement_type
}


//

interface ActionReplaceAllStatements extends Action {
    statements: Statement[]
}

const replace_all_statements_type = "replace_all_statements"


interface ReplaceAllStatementsProps
{
    statements: Statement[]
}
const replace_all_statements = (args: ReplaceAllStatementsProps): ActionReplaceAllStatements =>
{
    return {
        type: replace_all_statements_type,
        statements: args.statements,
    }
}

const is_replace_all_statements = (action: AnyAction): action is ActionReplaceAllStatements => {
    return action.type === replace_all_statements_type
}


export const statement_actions = {
    add_statement,
    delete_statement,
    replace_all_statements,
}
