import { find_match_by_inclusion_of_key } from "../../../utils/object"



export type OIDC_ProviderRoot = "solidcommunity.net" | "inrupt.com"


export const OIDC_provider_map: {[P in OIDC_ProviderRoot]: string} = {
    "solidcommunity.net": "https://solidcommunity.net",
    "inrupt.com": "https://broker.pod.inrupt.com",
}


const pod_URL_template_map: {[P in OIDC_ProviderRoot]: string} = {
    "solidcommunity.net": "https://<user_name>.solidcommunity.net",
    "inrupt.com": "https://pod.inrupt.com/<user_name>",
}

export function make_default_solid_pod_URL (args: { solid_oidc_provider: string, user_name: string })
{
    const { solid_oidc_provider, user_name } = args

    if (!solid_oidc_provider || !user_name) return ""

    const pod_URL_template_pair = find_match_by_inclusion_of_key(solid_oidc_provider, pod_URL_template_map)

    if (!pod_URL_template_pair) return ""

    const pod_URL_template = pod_URL_template_pair[1]

    return pod_URL_template.replace("<user_name>", user_name)
}
