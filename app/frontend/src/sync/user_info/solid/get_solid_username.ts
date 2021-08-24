import {
    getSolidDataset,
    getThing,
    getStringNoLocale,
} from "@inrupt/solid-client"
import { getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { find_match_by_inclusion_of_key } from "../../../utils/object"
import type { OIDC_ProviderRoot } from "./urls"



export function update_user_name (update_user_name_from_solid: (args: { user_name_from_solid: string }) => void)
{
    const user_name_from_solid = get_solid_username()

    update_user_name_from_solid({ user_name_from_solid })
}



const solid_username_URL_regex_map: {[P in OIDC_ProviderRoot]: RegExp} = {
    "solidcommunity.net": /https?:\/\/([^.]+)/,
    "inrupt.com": /https?:\/\/[^\/]+\/(.+)/,
}

export function get_solid_username (): string
{
    const session = getDefaultSession()

    const web_id = session.info.webId

    if (!session.info.isLoggedIn || !web_id) return ""

    const match = find_match_by_inclusion_of_key(web_id, solid_username_URL_regex_map)
    const regexp = match ? match[1] : undefined
    if (!regexp) return ""

    const regexp_match = web_id.match(regexp)
    const username = regexp_match && regexp_match[1]
    if (!username)
    {
        console.error(`Failure to extract username from web_id: "${web_id}" using: "${regexp_match}"`)
        return ""
    }

    return username
}



export async function get_solid_users_name (): Promise<string | undefined>
{
    const session = getDefaultSession()

    const web_id = session.info.webId

    if (!session.info.isLoggedIn || !web_id) return undefined

    // The web_id can contain a hash fragment (e.g. `#me`) to refer to profile data
    // in the profile dataset. If we strip the hash, we get the URL of the full
    // dataset.
    const profile_document_url = new URL(web_id)

    profile_document_url.hash = ""

    // To write to a profile, you must be authenticated. That is the role of the fetch
    // parameter in the following call.
    // TODO: can we drop the use of the fetch as someone's profile name is always public?
    const user_profile_dataset = await getSolidDataset(profile_document_url.href, {
        fetch: session.fetch
    })

    // The profile data is a "Thing" in the profile dataset.
    const profile = getThing(user_profile_dataset, web_id)

    if (!profile) return undefined

    // Using the name provided in text field, update the name in your profile.
    // VCARD.fn object from "@inrupt/vocab-common-rdf" is a convenience object that
    // includes the identifier string "http://www.w3.org/2006/vcard/ns#fn".
    // As an alternative, you can pass in the "http://www.w3.org/2006/vcard/ns#fn" string instead of VCARD.fn.
    let name = getStringNoLocale(profile, "http://www.w3.org/2006/vcard/ns#fn")

    if (name === null)
    {
        name = getStringNoLocale(profile, "http://xmlns.com/foaf/0.1/name")
    }

    return name || ""
}
