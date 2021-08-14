import {
    addInteger,
    addStringNoLocale,
    createSolidDataset,
    createThing,
    getContainedResourceUrlAll,
    getSolidDataset,
    saveSolidDatasetAt,
    setThing,
} from "@inrupt/solid-client"
import { fetch as solid_fetch } from "@inrupt/solid-client-authn-browser"

import type { SpecialisedObjectsFromToServer } from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../../State"
import type { SyncError } from "./errors"



export function get_solid_data ()
{
    // ensure_directory(solid_pod_URL)

    return Promise.resolve<SpecialisedObjectsFromToServer>({
        knowledge_views: [],
        wcomponents: [],
        perceptions: [],
    })
}



export async function save_solid_data (state: RootState, data: SpecialisedObjectsFromToServer)
{
    const { solid_pod_URL } = state.user_info
    if (!solid_pod_URL)
    {
        const error: SyncError = { type: "insufficient_information", message: "Lacking solid_pod_URL" }
        return Promise.reject(error)
    }
    const knowledge_views_url = get_knowledge_views_url(solid_pod_URL)


    const kv1 = data.knowledge_views[0]
    if (!kv1) return Promise.resolve()


    let dataset_kv1 = createSolidDataset()
    let thing_kv1 = createThing({ name: "kv" })
    thing_kv1 = addStringNoLocale(thing_kv1, "http://datacurator.org/schema/v1/title", kv1.title)
    dataset_kv1 = setThing(dataset_kv1, thing_kv1)


    try {
        const knowledge_view_url = knowledge_views_url + kv1.id + ".ttl"

        console.log("Saving...")
        // Save the SolidDataset
        /* let saved_dataset_kv1 = */ await saveSolidDatasetAt(
            knowledge_view_url,
            dataset_kv1,
            { fetch: solid_fetch }
        )
        console.log("Saved!")

        return Promise.resolve()
    } catch (err) {
        console.error("error saving knowledge view", err)
        const error: SyncError = { type: "general", message: err }
        return Promise.reject(error)
    }
}



async function ensure_directory (solid_pod_URL: string)
{
    const knowledge_views_url = get_knowledge_views_url(solid_pod_URL)
    const dataset1 = await getSolidDataset(knowledge_views_url, { fetch: solid_fetch })

    const result1 = await getContainedResourceUrlAll(dataset1)
}


const get_knowledge_views_url = (pod_URL: string) => `${pod_URL}/data_curator_v1/knowledge_views/`
