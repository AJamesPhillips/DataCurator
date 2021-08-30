import type { Dispatch } from "redux"
import { getItem } from "localforage"

import { LOCAL_STORAGE_STATE_KEY } from "../../../constants"
import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../actions"
import { parse_specialised_objects_from_server_data } from "../../specialised_objects/parse_server_data"
import type { Statement, Pattern, ObjectWithCache, RootState } from "../../State"
import { error_to_string, SyncError } from "./errors"
import { load_solid_data } from "./solid_load_data"
import type { StorageType } from "../state"



export function load_state (dispatch: Dispatch, state: RootState)
{
    const { storage_type } = state.sync
    if (!storage_type)
    {
        console.log("Returning early from load_state.  No storage_type set")
        return
    }


    dispatch(ACTIONS.sync.update_sync_status({ status: "LOADING" }))

    const promise_data = get_state_data(storage_type, state)
    if (!promise_data)
    {
        dispatch(ACTIONS.sync.update_sync_status({ status: "FAILED" }))
        return
    }


    promise_data
    .then(specialised_objects =>
    {
        dispatch(ACTIONS.specialised_object.replace_all_specialised_objects({ specialised_objects }))

        const a_knowledge_view_id = specialised_objects.knowledge_views[0]?.id
        dispatch(ACTIONS.routing.change_route({ args: { subview_id: a_knowledge_view_id } }))

        dispatch(ACTIONS.sync.update_sync_status({ status: "LOADED" }))
    })
    .catch((error: SyncError | Error) =>
    {
        const error_message = error_to_string(error)
        console.error(error)
        dispatch(ACTIONS.sync.update_sync_status({ status: "FAILED", error_message }))
    })
}



export function get_state_data (storage_type: StorageType, state: RootState)
{
    let promise_data: Promise<SpecialisedObjectsFromToServer | null>

    if (storage_type === "local_server")
    {
        promise_data = fetch("http://localhost:4000/api/v1/specialised_state/", { method: "get" })
            .then(resp => resp.json())
    }
    else if (storage_type === "solid")
    {
        promise_data = load_solid_data(state)
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

    return promise_data.then(data => parse_specialised_objects_from_server_data(data))
}



function parse_datetimes<T extends { datetime_created: Date }> (items: T[]): T[]
{
    return items.map(i => ({ ...i, datetime_created: new Date(i.datetime_created) }))
}
