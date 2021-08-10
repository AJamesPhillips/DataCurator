import type { Dispatch } from "redux"
import { getItem } from "localforage"

import { ACTIONS } from "../../actions"
import { parse_specialised_objects_from_server_data } from "../../specialised_objects/parse_server_data"
import type { Statement, Pattern, ObjectWithCache } from "../../State"
import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { LOCAL_STORAGE_STATE_KEY, STORAGE_TYPE } from "./supported_keys"



export function load_state (dispatch: Dispatch)
{
    dispatch(ACTIONS.sync.update_sync_status({ status: "LOADING" }))

    let promise_data: Promise<SpecialisedObjectsFromToServer | null>

    if (STORAGE_TYPE === "local_server")
    {
        promise_data = fetch("http://localhost:4000/api/v1/specialised_state/", { method: "get" })
            .then(resp => resp.json())
    }
    else
    {
        promise_data = getItem<SpecialisedObjectsFromToServer>(LOCAL_STORAGE_STATE_KEY)
    }

    // fetch("http://localhost:4000/api/v1/state/", {
    //     method: "get",
    // })
    // .then(resp => resp.json())
    // .then(data => {

    //     // Object.keys(data).forEach(k => {
    //     //     if (!supported_keys.includes(k as any)) throw new Error(`Unexpected key "${k}" in state from server`)
    //     // })

    //     let statements: Statement[] = data.statements
    //     let patterns: Pattern[] = data.patterns
    //     let objects: ObjectWithCache[] = data.objects

    //     if (!statements) throw new Error(`Expecting statements from server`)
    //     if (!patterns) throw new Error(`Expecting patterns from server`)
    //     if (!objects) throw new Error(`Expecting objects from server`)

    //     statements = parse_datetimes(statements)
    //     patterns = parse_datetimes(patterns)
    //     objects = parse_datetimes(objects)

    //     dispatch(ACTIONS.statement.replace_all_statements({ statements }))
    //     dispatch(ACTIONS.pattern.replace_all_patterns({ patterns }))
    //     dispatch(ACTIONS.object.replace_all_core_objects({ objects }))

    // })

    promise_data
    .then(data =>
    {
        const specialised_objects = parse_specialised_objects_from_server_data(data)

        dispatch(ACTIONS.specialised_object.replace_all_specialised_objects({ specialised_objects }))

        dispatch(ACTIONS.sync.update_sync_status({ status: undefined }))
    })
    .catch(err =>
    {
        dispatch(ACTIONS.sync.update_sync_status({ status: "FAILED", error_message: `${err}` }))
    })
}


function parse_datetimes<T extends { datetime_created: Date }> (items: T[]): T[]
{
    return items.map(i => ({ ...i, datetime_created: new Date(i.datetime_created) }))
}
