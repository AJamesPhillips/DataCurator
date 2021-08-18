import {
    addStringNoLocale,
    createSolidDataset,
    createThing,
    saveSolidDatasetAt,
    setThing,
} from "@inrupt/solid-client"
import { fetch as solid_fetch } from "@inrupt/solid-client-authn-browser"

import type { KnowledgeView } from "../../../shared/wcomponent/interfaces/knowledge_view"
import type {
    SpecialisedObjectsFromToServer,
    WComponent,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { UserInfoState } from "../../user_info/state"
import type { SyncError } from "./errors"
import { get_knowledge_views_url, get_wcomponents_url, V1 } from "./solid"



export async function save_solid_data (user_info: UserInfoState, data: SpecialisedObjectsFromToServer)
{
    const { solid_pod_URL, promised_error } = get_solid_pod_URL_or_error(user_info)
    if (!solid_pod_URL) return promised_error


    return save_knowledge_views(solid_pod_URL, data.knowledge_views)
    .then(() => save_wcomponents(solid_pod_URL, data.wcomponents))
}



function get_solid_pod_URL_or_error (user_info: UserInfoState)
{
    const { solid_pod_URL } = user_info
    let promised_error: Promise<SpecialisedObjectsFromToServer> | undefined = undefined

    if (!solid_pod_URL)
    {
        const error: SyncError = { type: "insufficient_information", message: "Lacking solid_pod_URL" }
        promised_error = Promise.reject(error)
    }

    return { solid_pod_URL, promised_error }
}



async function save_knowledge_views (solid_pod_URL: string, knowledge_views: KnowledgeView[])
{

    const knowledge_views_url = get_knowledge_views_url(solid_pod_URL)


    let knowledge_views_dataset = createSolidDataset()
    knowledge_views.forEach(kv =>
    {
        let thing_kv = createThing({ name: kv.id })
        thing_kv = addStringNoLocale(thing_kv, V1.title, kv.title)
        // thing_kv = addBoolean(thing_kv, "http://datacurator.org/schema/v1/is_base", kv.is_base)
        thing_kv = addStringNoLocale(thing_kv, V1.json, JSON.stringify(kv))
        knowledge_views_dataset = setThing(knowledge_views_dataset, thing_kv)
    })


    try {
        // console .log("Saving...")
        // Save the SolidDataset
        /* let saved_knowledge_views_dataset = */ await saveSolidDatasetAt(
            knowledge_views_url,
            knowledge_views_dataset,
            { fetch: solid_fetch }
        )
        //console .log("Saved!")

        return Promise.resolve()
    } catch (err) {
        console.error("error saving knowledge_views", err)
        const error: SyncError = { type: "general", message: err }
        return Promise.reject(error)
    }
}



async function save_wcomponents (solid_pod_URL: string, wcomponents: WComponent[])
{

    const wcomponents_url = get_wcomponents_url(solid_pod_URL)


    let wcomponents_dataset = createSolidDataset()
    wcomponents.forEach(kv =>
    {
        let thing_kv = createThing({ name: kv.id })
        thing_kv = addStringNoLocale(thing_kv, V1.title, kv.title)
        // thing_kv = addBoolean(thing_kv, "http://datacurator.org/schema/v1/is_base", kv.is_base)
        thing_kv = addStringNoLocale(thing_kv, V1.json, JSON.stringify(kv))
        wcomponents_dataset = setThing(wcomponents_dataset, thing_kv)
    })


    try {
        // console .log("Saving...")
        // Save the SolidDataset
        /* let saved_wcomponents_dataset = */ await saveSolidDatasetAt(
            wcomponents_url,
            wcomponents_dataset,
            { fetch: solid_fetch }
        )
        //console .log("Saved!")

        return Promise.resolve()
    } catch (err) {
        console.error("error saving wcomponents", err)
        const error: SyncError = { type: "general", message: err }
        return Promise.reject(error)
    }
}
