import {
    getSolidDataset,
    getStringNoLocale,
    getThingAll,
} from "@inrupt/solid-client"
import { fetch as solid_fetch } from "@inrupt/solid-client-authn-browser"

import { is_defined } from "../../../shared/utils/is_defined"
import type { KnowledgeView } from "../../../shared/wcomponent/interfaces/knowledge_view"
import type {
    SpecialisedObjectsFromToServer,
    WComponent,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../../State"
import type { SyncError } from "./errors"
import { get_knowledge_views_url, get_solid_pod_URL_or_error, get_wcomponents_url, V1 } from "./solid"



export async function load_solid_data (state: RootState)
{
    const { solid_pod_URL, promised_error } = get_solid_pod_URL_or_error(state.user_info, "load")
    if (promised_error) return Promise.reject(promised_error)

    const knowledge_views_response = await get_knowledge_views(solid_pod_URL)
    if (knowledge_views_response.error) return Promise.reject(knowledge_views_response.error)

    const wcomponents_response = await get_wcomponents(solid_pod_URL)
    if (wcomponents_response.error) return Promise.reject(wcomponents_response.error)


    return Promise.resolve<SpecialisedObjectsFromToServer>({
        knowledge_views: knowledge_views_response.items,
        wcomponents: wcomponents_response.items,
        perceptions: [],
    })
}



async function get_knowledge_views (solid_pod_URL: string)
{
    const knowledge_views_url = get_knowledge_views_url(solid_pod_URL)
    return get_items<KnowledgeView>(knowledge_views_url)
}



async function get_wcomponents (solid_pod_URL: string)
{
    const wcomponents_url = get_wcomponents_url(solid_pod_URL)
    return get_items<WComponent>(wcomponents_url)
}



async function get_items <I> (items_url: string): Promise<{ items: I[], error: SyncError | undefined }>
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
