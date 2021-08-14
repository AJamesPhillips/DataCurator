import type { Dispatch } from "redux"
import { getItem } from "localforage"

import { LOCAL_STORAGE_STATE_KEY } from "../../../constants"
import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../actions"
import { parse_specialised_objects_from_server_data } from "../../specialised_objects/parse_server_data"
import type { Statement, Pattern, ObjectWithCache, RootState } from "../../State"
import { load_solid_data } from "./solid"



export function load_state (dispatch: Dispatch, state: RootState)
{
    const { storage_type } = state.sync
    if (!storage_type)
    {
        console.log("Returning early from load_state.  No storage_type set")
        return
    }


    dispatch(ACTIONS.sync.update_sync_status({ status: "LOADING" }))

    let promise_data: Promise<SpecialisedObjectsFromToServer | null>

    if (storage_type === "local_server")
    {
        promise_data = fetch("http://localhost:4000/api/v1/specialised_state/", { method: "get" })
            .then(resp => resp.json())
    }
    else if (storage_type === "solid")
    {
        promise_data = load_solid_data(state, dispatch)
    }
    else if (storage_type === "local_storage")
    {
        promise_data = getItem<SpecialisedObjectsFromToServer>(LOCAL_STORAGE_STATE_KEY)
    }
    else
    {
        console.error(`Returning from load_state.  storage_type "${storage_type}" unsupported.`)
        return
    }

    // fetch("http://localhost:4000/api/v1/state/", {
    //     method: "get",
    // })
    // .then(resp => resp.json())
    // .then(data => {

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
