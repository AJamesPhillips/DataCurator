


export type OIDC_ProviderRoot = "solidcommunity.net" | "inrupt.com"


export const OIDC_provider_map: {[P in OIDC_ProviderRoot]: string} = {
    "solidcommunity.net": "https://solidcommunity.net",
    "inrupt.com": "https://broker.pod.inrupt.com",
}
