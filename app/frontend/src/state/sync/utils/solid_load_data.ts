import {
    getSolidDataset,
    getStringNoLocale,
    getThingAll,
} from "@inrupt/solid-client"
import { fetch as solid_fetch } from "@inrupt/solid-client-authn-browser"
import type { Dispatch } from "redux"

import { is_defined } from "../../../shared/utils/is_defined"
import type { KnowledgeView } from "../../../shared/wcomponent/interfaces/knowledge_view"
import type {
    SpecialisedObjectsFromToServer,
    WComponent,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../actions"
import type { RootState } from "../../State"
import type { SyncError } from "./errors"
import { get_knowledge_views_url, get_wcomponents_url, V1 } from "./solid"



export async function load_solid_data (state: RootState, dispatch: Dispatch)
{
    const { solid_pod_URL, promised_error } = get_solid_pod_URL_or_error(state)
    if (promised_error) return promised_error

    const knowledge_views_response = await get_knowledge_views(solid_pod_URL, dispatch)
    if (knowledge_views_response.error) return Promise.reject(knowledge_views_response.error)

    const wcomponents_response = await get_wcomponents(solid_pod_URL, dispatch)
    if (wcomponents_response.error) return Promise.reject(wcomponents_response.error)


    return Promise.resolve<SpecialisedObjectsFromToServer>({
        knowledge_views: knowledge_views_response.items,
        wcomponents: wcomponents_response.items,
        perceptions: [],
    })
}



function get_solid_pod_URL_or_error (state: RootState)
{
    const { solid_pod_URL } = state.user_info
    let promised_error: Promise<SpecialisedObjectsFromToServer> | undefined = undefined

    if (!solid_pod_URL)
    {
        const error: SyncError = { type: "insufficient_information", message: "Lacking solid_pod_URL" }
        promised_error = Promise.reject(error)
    }

    return { solid_pod_URL, promised_error }
}



async function get_knowledge_views (solid_pod_URL: string, dispatch: Dispatch)
{
    const knowledge_views_url = get_knowledge_views_url(solid_pod_URL)
    return get_items<KnowledgeView>(knowledge_views_url, dispatch)
}



async function get_wcomponents (solid_pod_URL: string, dispatch: Dispatch)
{
    const wcomponents_url = get_wcomponents_url(solid_pod_URL)
    return get_items<WComponent>(wcomponents_url, dispatch)
}



async function get_items <I> (items_url: string, dispatch: Dispatch): Promise<{ items: I[], error: SyncError | undefined }>
{
    let items: I[] = []
    let error: SyncError | undefined = undefined

    try {
        const items_dataset = await getSolidDataset(items_url, { fetch: solid_fetch })
        const things = await getThingAll(items_dataset)
        items = things
            .map(item => getStringNoLocale(item, V1.json))
            .map(item => item ? JSON.parse(item) : undefined)
            .filter(is_defined)

        dispatch(ACTIONS.sync.update_sync_status(({ status: "LOADING" })))
    } catch (err)
    {
        if (err.statusCode !== 404)
        {
            const message = `error loading items from: ${items_url}: ` + err
            error = { type: "loading_error", message }
        }
    }

    return { items, error }
}
