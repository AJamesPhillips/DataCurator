import {
    addStringNoLocale,
    createSolidDataset,
    createThing,
    getContainedResourceUrlAll,
    getSolidDataset,
    saveSolidDatasetAt,
    setThing,
} from "@inrupt/solid-client"
import { fetch as solid_fetch } from "@inrupt/solid-client-authn-browser"
import type { Dispatch } from "redux"

import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../actions"
import type { RootState } from "../../State"
import type { SyncError } from "./errors"



export async function load_solid_data (state: RootState, dispatch: Dispatch)
{
    const { solid_pod_URL, promised_error } = get_solid_pod_URL_or_error(state)
    if (promised_error) return promised_error

    const knowledge_views = await get_knowledge_views(solid_pod_URL, dispatch)

    return Promise.resolve<SpecialisedObjectsFromToServer>({
        knowledge_views: [],
        wcomponents: [],
        perceptions: [],
    })
}



export async function save_solid_data (state: RootState, data: SpecialisedObjectsFromToServer)
{
    const { solid_pod_URL, promised_error } = get_solid_pod_URL_or_error(state)
    if (!solid_pod_URL) return promised_error
    const knowledge_views_url = get_knowledge_views_url(solid_pod_URL)


    const kv1 = data.knowledge_views[0]
    if (!kv1) return Promise.resolve()


    let dataset_kv1 = createSolidDataset()
    let thing_kv1 = createThing({ name: "kv" })
    thing_kv1 = addStringNoLocale(thing_kv1, "http://datacurator.org/schema/v1/title", kv1.title)
    // thing_kv1 = addBoolean(thing_kv1, "http://datacurator.org/schema/v1/is_base", kv1.is_base)
    thing_kv1 = addStringNoLocale(thing_kv1, "http://datacurator.org/schema/v1/knowledge_view_json", JSON.stringify(kv1))
    dataset_kv1 = setThing(dataset_kv1, thing_kv1)


    try {
        const knowledge_view_url = knowledge_views_url + kv1.id + ".ttl"

        // console .log("Saving...")
        // Save the SolidDataset
        /* let saved_dataset_kv1 = */ await saveSolidDatasetAt(
            knowledge_view_url,
            dataset_kv1,
            { fetch: solid_fetch }
        )
        //console .log("Saved!")

        return Promise.resolve()
    } catch (err) {
        console.error("error saving knowledge view", err)
        const error: SyncError = { type: "general", message: err }
        return Promise.reject(error)
    }
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
    const wcomponents_url = get_wcomponents_url(solid_pod_URL)

    const knowledge_views_container = await getSolidDataset(knowledge_views_url, { fetch: solid_fetch })
    const wcomponents_container = await getSolidDataset(wcomponents_url, { fetch: solid_fetch })

    const knowledge_view_URLs = await getContainedResourceUrlAll(knowledge_views_container)
    const wcomponent_URLs = await getContainedResourceUrlAll(wcomponents_container)

    const total_items = knowledge_view_URLs.length + wcomponent_URLs.length
    let progress = 0

    dispatch(ACTIONS.sync.update_sync_status(({ status: "LOADING", progress })))

    // TODO...

}


const get_knowledge_views_url = (pod_URL: string) => `${pod_URL}/data_curator_v1/knowledge_views/`
const get_wcomponents_url = (pod_URL: string) => `${pod_URL}/data_curator_v1/world_components/`
