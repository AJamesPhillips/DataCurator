import {
    getIri,
    getSolidDataset,
    getThing,
    getStringNoLocale,
} from "@inrupt/solid-client"
import { getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { ERRORS } from "../../../shared/errors"



interface UserNameAndPodURL
{
    user_name: string
    default_solid_pod_URL: string
}
const empty: UserNameAndPodURL = { user_name: "", default_solid_pod_URL: "" }


export async function get_solid_users_name_and_pod_URL (): Promise<UserNameAndPodURL>
{
    const session = getDefaultSession()
    if (!session.info.isLoggedIn) return Promise.reject(ERRORS.NOT_LOGGED_IN)

    const web_id = session.info.webId
    if (!web_id) return Promise.reject(ERRORS.NO_SOLID_WEB_ID)

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

    if (!profile) return empty

    // Using the name provided in text field, update the name in your profile.
    // VCARD.fn object from "@inrupt/vocab-common-rdf" is a convenience object that
    // includes the identifier string "http://www.w3.org/2006/vcard/ns#fn".
    // As an alternative, you can pass in the "http://www.w3.org/2006/vcard/ns#fn" string instead of VCARD.fn.
    let user_name = getStringNoLocale(profile, "http://www.w3.org/2006/vcard/ns#fn") || ""

    if (!user_name)
    {
        user_name = getStringNoLocale(profile, "http://xmlns.com/foaf/0.1/name") || ""
    }

    const default_solid_pod_URL = getIri(profile, "http://www.w3.org/ns/pim/space#storage") || ""


    return {
        user_name,
        default_solid_pod_URL,
    }
}
