import type { UserInfoState } from "../../user_info/state"
import type { SyncError } from "./errors"



const _V1 = "http://datacurator.org/schema/v1/"

export const V1 = {
    title: _V1 + "title",
    json: _V1 + "json",
}


export const get_knowledge_views_url = (pod_URL: string) => `${pod_URL}data_curator_v1/knowledge_views.ttl`
export const get_wcomponents_url = (pod_URL: string) => `${pod_URL}data_curator_v1/world_components.ttl`



export function get_solid_pod_URL_or_error (user_info: UserInfoState, purpose: "save" | "load" | "reducer-sync")
{
    const { default_solid_pod_URL, chosen_custom_solid_pod_URL_index, custom_solid_pod_URLs } = user_info
    let promised_error: Promise<any> | undefined = undefined
    let solid_pod_URL = default_solid_pod_URL

    if (chosen_custom_solid_pod_URL_index)
    {
        solid_pod_URL = custom_solid_pod_URLs[chosen_custom_solid_pod_URL_index - 1] || ""
    }

    if (!solid_pod_URL)
    {
        const error: SyncError = { type: "insufficient_information", message: `Lacking solid_pod_URL for ${purpose}` }
        promised_error = Promise.reject(error)
    }

    return { solid_pod_URL, promised_error }
}
