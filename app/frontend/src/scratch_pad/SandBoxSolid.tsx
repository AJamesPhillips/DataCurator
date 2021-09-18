import {
    createSolidDataset,
    createThing,
    addStringNoLocale,
    setThing,
    saveSolidDatasetAt,
    getSolidDataset,
    getThingAll,
    getStringNoLocale,
    deleteSolidDataset,
    getResourceAcl,
    getSolidDatasetWithAcl,
    getAgentResourceAccess,
    getAgentAccessAll,
} from "@inrupt/solid-client"
import { fetch as solid_fetch, getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { h } from "preact"
import { useState } from "preact/hooks"
import { get_new_knowledge_view_object } from "../knowledge_view/create_new_knowledge_view"

import { is_defined } from "../shared/utils/is_defined"
import { get_contextless_new_wcomponent_object, get_new_wcomponent_object } from "../shared/wcomponent/get_new_wcomponent_object"
import type { KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"
import type { WComponent } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import type { SyncError } from "../state/sync/utils/errors"
import { V1 } from "../state/sync/utils/solid"
import { load_solid_data } from "../state/sync/utils/solid_load_data"
import { save_solid_data } from "../state/sync/utils/solid_save_data"
import { finish_login, start_login } from "../sync/user_info/solid/handle_login"

import "./SandBox.css"



const url_groups: { broker: string, pod_directory: string }[] = [
    { broker: "https://broker.pod.inrupt.com", pod_directory: "https://pod.inrupt.com/ajp/data_curator_sandbox/" },
    { broker: "https://trinpod.us/", pod_directory: "https://ajp.trinpod.us/" },
]
const urls = url_groups[0]!


export function SandBoxSolid ()
{
    const [, update_view] = useState({})

    const solid_session = getDefaultSession()

    const { isLoggedIn } = solid_session.info
    finish_login().then(() =>
    {
        if (isLoggedIn !== solid_session.info.isLoggedIn) update_view({})
    })


    if (!isLoggedIn) return (
        <div onClick={() => start_login(solid_session, urls.broker)}>
            Signin
        </div>
    )


    return (
        <div>
            Logged in

            <div onClick={() => save_and_load()}>Save and load</div>
            <div onClick={() => get_acl()}>Get ACL</div>
        </div>
    )
}



async function save_and_load ()
{
    const url = urls.pod_directory
    const state: RootState = {
        user_info: {
            solid_oidc_provider: urls.broker,
            user_name: "abc",
            default_solid_pod_URL: url,
            custom_solid_pod_URLs: [],
            chosen_custom_solid_pod_URL_index: 0,
        }
    } as Partial<RootState> as any

    await save_solid_data(state.user_info, {
        knowledge_views,
        wcomponents,
        perceptions: [],
    })
    const items = await load_solid_data(state)
    console .log("got items", items)
}


const wc1 = get_contextless_new_wcomponent_object({ title: "wc1" })
const wcomponents: WComponent[] = [wc1]

const kv1 = get_new_knowledge_view_object({
    title: "kv1",
    wc_id_map: {
        [wc1.id]: { left: 0, top: 0 },
    },
})
const knowledge_views: KnowledgeView[] = [kv1]



async function get_acl ()
{
    const url = "https://pod.inrupt.com/ajp/data_curator_v1/"

    const dataset = await getSolidDatasetWithAcl(url, { fetch: solid_fetch })
    // console .log("got dataset", dataset)

    const accessByAgent = getAgentAccessAll(dataset)
    if (!accessByAgent) return console.log("No accessByAgent for ", url)

    // => accessByAgent is an object with Agent WebIDs as keys,
    //    and their associated access object {read: <boolean>, ... } as values.
    for (const [agent, access] of Object.entries(accessByAgent)) {
        console.log(agent, access)
    }

}
