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
} from "@inrupt/solid-client"
import { fetch as solid_fetch, getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { h } from "preact"
import { get_new_knowledge_view_object } from "../knowledge_view/create_new_knowledge_view"

import { is_defined } from "../shared/utils/is_defined"
import { get_new_wcomponent_object } from "../shared/wcomponent/get_new_wcomponent_object"
import type { RootState } from "../state/State"
import type { SyncError } from "../state/sync/utils/errors"
import { V1 } from "../state/sync/utils/solid"
import { load_solid_data } from "../state/sync/utils/solid_load_data"
import { save_solid_data } from "../state/sync/utils/solid_save_data"
import { start_login } from "../sync/user_info/solid/handle_login"

import "./SandBox.css"



export function SandBoxSolid ()
{
    const solid_session = getDefaultSession()

    return <div>
        {solid_session.info.isLoggedIn ? "Logged in" : <div onClick={() => {start_login(solid_session, "https://broker.pod.inrupt.com")}}>Signin</div>}

        {solid_session.info.isLoggedIn && <div onClick={() => main()}>Save and load</div>}
    </div>
}



async function main()
{
    const url = "https://pod.inrupt.com/ajp/"
    const state: RootState = {
        user_info: {
            solid_oidc_provider: "https://broker.pod.inrupt.com",
            user_name: "abc",
            default_solid_pod_URL: url,
            custom_solid_pod_URLs: [],
            chosen_custom_solid_pod_URL_index: 0,
        }
    } as any

    await save_solid_data(state.user_info, {
        knowledge_views: knowledge_views.map(j => JSON.parse(j)),
        wcomponents: wcomponents.map(j => JSON.parse(j)),
        perceptions: [],
        wcomponent_ids_to_delete: new Set(),
    })
    const items = await load_solid_data(state)
    console .log("got items", items)
}


const knowledge_views: any[] = []
const wcomponents: any[] = []
