import {
    addStringNoLocale,
    createSolidDataset,
    createThing,
    deleteSolidDataset,
    getSolidDataset,
    removeThing,
    saveSolidDatasetAt,
    setThing,
    SolidDataset,
} from "@inrupt/solid-client"
import { fetch as solid_fetch } from "@inrupt/solid-client-authn-browser"
import type { Base } from "../../../shared/wcomponent/interfaces/base"

import type { KnowledgeView } from "../../../shared/wcomponent/interfaces/knowledge_view"
import type {
    SpecialisedObjectsFromToServer,
    WComponent,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { UserInfoState } from "../../user_info/state"
import type { SyncError } from "./errors"
import { get_knowledge_views_url, get_solid_pod_URL_or_error, get_wcomponents_url, V1 } from "./solid"
import { solid_dataset_cache } from "./solid_dataset_cache"



export async function save_solid_data (user_info: UserInfoState, data: SpecialisedObjectsFromToServer)
{
    const { solid_pod_URL, promised_error } = get_solid_pod_URL_or_error(user_info, "save")
    if (!solid_pod_URL) return Promise.reject(promised_error)

    return save_knowledge_views(solid_pod_URL, data.knowledge_views)
    .then(() => save_wcomponents(solid_pod_URL, data.wcomponents))
}



async function save_knowledge_views (solid_pod_URL: string, knowledge_views: KnowledgeView[])
{

    const knowledge_views_url = get_knowledge_views_url(solid_pod_URL)
    const result = await save_items(knowledge_views_url, knowledge_views, []) //, solid_dataset_cache.knowledge_views_dataset)
    solid_dataset_cache.knowledge_views_dataset = result.items_dataset
    return result.error && Promise.reject(result.error)
}



async function save_wcomponents (solid_pod_URL: string, wcomponents: WComponent[])
{
    const wcomponents_url = get_wcomponents_url(solid_pod_URL)
    const result = await save_items(wcomponents_url, wcomponents, []) //, solid_dataset_cache.wcomponents_dataset)
    solid_dataset_cache.wcomponents_dataset = result.items_dataset
    return result.error && Promise.reject(result.error)
}



async function save_items <I extends Base & { title: string }> (items_URL: string, items: I[], item_ids_to_remove: string[]) //, cached_items_dataset: SolidDataset | undefined)
{
    let items_dataset = createSolidDataset()
    let error: SyncError | undefined = undefined

    // if (cached_items_dataset)
    // {
    //     items_dataset = cached_items_dataset
    // }
    // else
    // {
    try
    {
        items_dataset = await getSolidDataset(items_URL, { fetch: solid_fetch })
    }
    catch (err)
    {
        if (!err || (err.statusCode !== 404)) console.error(`Error deleting "${items_URL}"`, err)
    }
    // }


    items.forEach(item =>
    {
        let thing = createThing({ name: item.id })
        thing = addStringNoLocale(thing, V1.title, item.title)
        thing = addStringNoLocale(thing, V1.json, JSON.stringify(item))
        items_dataset = setThing(items_dataset, thing)
    })


    item_ids_to_remove.forEach(id =>
    {
        const thing_URL = items_URL + "#" + id
        items_dataset = removeThing(items_dataset, thing_URL)
    })


    try {
        // console .log("Saving...")
        // Save the SolidDataset
        items_dataset = await saveSolidDatasetAt(items_URL, items_dataset, { fetch: solid_fetch })
        //console .log("Saved!")
    } catch (err) {
        console.error(`error saving items to "${items_URL}" :`, err)
        error = { type: "general", message: err }
    }

    return { items_dataset, error }
}
