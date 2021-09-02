


export type OIDC_ProviderRoot = "inrupt.com" //| "solidcommunity.net"


export const OIDC_provider_map: {[P in OIDC_ProviderRoot]: string} = {
    // "solidcommunity.net": "https://solidcommunity.net",
    "inrupt.com": "https://broker.pod.inrupt.com",
}
