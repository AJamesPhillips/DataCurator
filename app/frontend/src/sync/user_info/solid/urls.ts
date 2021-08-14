import type { RootState } from "../../../state/State"



export type OIDC_ProviderRoot = "solidcommunity.net" | "inrupt.com"


export const OIDC_provider_map: {[P in OIDC_ProviderRoot]: string} = {
    "solidcommunity.net": "https://solidcommunity.net",
    "inrupt.com": "https://broker.pod.inrupt.com",
}


const pod_URL_template_map: {[P in OIDC_ProviderRoot]: string} = {
    "solidcommunity.net": "https://<user_name>.solidcommunity.net",
    "inrupt.com": "https://pod.inrupt.com/<user_name>",
}

export function get_pod_URL (state: RootState)
{
    const { solid_oidc_provider, user_name } = state.user_info

    if (!solid_oidc_provider || !user_name) return undefined

    const pod_URL_template_pair = Object.entries(pod_URL_template_map)
    .find(([root]) => solid_oidc_provider.includes(root))

    if (!pod_URL_template_pair) return undefined

    const pod_URL_template = pod_URL_template_pair[1]

    return pod_URL_template.replace("<user_name>", user_name)
}
