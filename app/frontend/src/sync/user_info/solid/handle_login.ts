import { Session, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser"
import { CLIENT_NAME } from "../../../constants"



// The process offered by Solid is terrible, buggy, does not work
const LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL = "solid_session_restore_url"



export function start_login (session: Session, oidcIssuer: string)
{
    if (oidcIssuer && !session.info.isLoggedIn)
    {
        const args = {
            oidcIssuer,
            clientName: CLIENT_NAME,
            redirectUrl: window.location.href,
        }
        console .log("Logging into solid session with: ", args)
        session.login(args)
    }
}



export async function correct_path ()
{
    const url = localStorage.getItem(LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL)
    if (!url) return

    const url_object = new URL(url)

    if (document.location.pathname === url_object.pathname) return

    const new_url = new URL(document.location.href)
    new_url.pathname = url_object.pathname
    document.location.href = new_url.toString()

    return Promise.reject()
}



export async function finish_login ()
{
    // The process offered by Solid is terrible, buggy, does not work
    localStorage.setItem(LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL, window.location.toString())

    await handleIncomingRedirect({ restorePreviousSession: true })
    localStorage.setItem(LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL, "")
}
