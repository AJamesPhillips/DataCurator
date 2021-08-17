import { setItem } from "localforage"
import type { Dispatch } from "redux"

import { LOCAL_STORAGE_STATE_KEY } from "../../../constants"
import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../actions"
import {
    RootState,
    ObjectWithCache,
    CoreObject,
    ObjectAttribute,
    CoreObjectAttribute,
    is_id_attribute,
} from "../../State"
import { get_store } from "../../store"
import { error_to_string, SyncError } from "./errors"
import { save_solid_data } from "./solid_save_data"



let last_saved: RootState | undefined = undefined
let attempting_save: boolean = false
export function save_state (load_state_from_storage: boolean, dispatch: Dispatch, state: RootState)
{
    if (!state.sync.ready || !load_state_from_storage) return

    if (!needs_save(state, last_saved) || attempting_save) return
    attempting_save = true

    dispatch(ACTIONS.sync.update_sync_status({ status: "SAVING" }))


    attempt_save(state, dispatch, 1)
}



const MAX_ATTEMPTS = 5
function attempt_save (state: RootState, dispatch: Dispatch, attempt: number)
{
    console .log("attempt_save", attempt)

    const { storage_type } = state.sync
    if (!storage_type)
    {
        const error_message = "Can not save.  No storage_type set"
        const action = ACTIONS.sync.update_sync_status({ status: "FAILED", error_message, retry_attempt: 0 })
        dispatch(action)
        return
    }


    const specialised_state = get_specialised_state_to_save(state)

    let promise_save_data: Promise<any>

    if (storage_type === "local_server")
    {
        // const state_to_save = get_state_to_save(state)
        // const state_str = JSON.stringify(state_to_save)

        // fetch("http://localhost:4000/api/v1/state/", {
        //     method: "post",
        //     body: state_str,
        // })

        const specialised_state_str = JSON.stringify(specialised_state)
        promise_save_data = fetch("http://localhost:4000/api/v1/specialised_state/", {
            method: "post",
            body: specialised_state_str,
        })
    }
    else if (storage_type === "solid")
    {
        promise_save_data = save_solid_data(state, specialised_state)
    }
    else if (storage_type === "local_storage")
    {
        promise_save_data = setItem(LOCAL_STORAGE_STATE_KEY, specialised_state)
    }
    else
    {
        console.error(`Returning from save_state.  storage_type "${storage_type}" unsupported.`)
        return
    }


    promise_save_data
    .then(() =>
    {
        attempting_save = false
        last_saved = state
        dispatch(ACTIONS.sync.update_sync_status({ status: undefined }))
    })
    .catch((error: SyncError | Error) =>
    {
        let error_message = error_to_string(error)

        if (attempt >= MAX_ATTEMPTS)
        {
            error_message = `Stopping attempt at resaving after ${attempt} attempts ${error_message}`
            console.error(error_message)

            attempting_save = false
            const action = ACTIONS.sync.update_sync_status({ status: "FAILED", error_message, retry_attempt: 0 })
            dispatch(action)
        }
        else
        {
            attempt += 1

            error_message = `Retrying, attempt ${attempt}; ${error_message}`
            console.error(error_message)

            const action = ACTIONS.sync.update_sync_status({
                status: "FAILED",
                error_message,
                retry_attempt: attempt,
            })
            dispatch(action)

            setTimeout(() =>
            {
                //console .log(`retrying, attempt ${attempt}`)
                const potentially_newer_state = get_store().getState()
                attempt_save(potentially_newer_state, dispatch, attempt)
            }, 1000)
        }
    })
}



function needs_save (state: RootState, last_saved: RootState | undefined)
{
    return (!last_saved ||
        // state.statements !== last_saved.statements ||
        // state.patterns !== last_saved.patterns ||
        // state.objects !== last_saved.objects ||
        state.specialised_objects !== last_saved.specialised_objects
    )
}


// function get_state_to_save (state: RootState)
// {
//     const state_to_save = {
//         statements: state.statements,
//         patterns: state.patterns,
//         objects: state.objects.map(convert_object_to_core),
//     }

//     return state_to_save
// }


function convert_object_to_core (object: ObjectWithCache): CoreObject
{
    return {
        id: object.id,
        datetime_created: object.datetime_created,
        labels: object.labels,
        attributes: object.attributes.map(convert_attribute_to_core),
        pattern_id: object.pattern_id,
        external_ids: object.external_ids,
    }
}

function convert_attribute_to_core (attribute: ObjectAttribute): CoreObjectAttribute
{
    if (is_id_attribute(attribute))
    {
        return {
            pidx: attribute.pidx,
            id: attribute.id,
        }
    }

    return {
        pidx: attribute.pidx,
        value: attribute.value,
    }
}


function get_specialised_state_to_save (state: RootState)
{
    const specialised_state: SpecialisedObjectsFromToServer = {
        perceptions: state.derived.perceptions,
        wcomponents: state.derived.wcomponents,
        knowledge_views: state.derived.knowledge_views,
    }

    return specialised_state
}
