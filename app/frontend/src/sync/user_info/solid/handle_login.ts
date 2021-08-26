import { Session, handleIncomingRedirect, getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { CLIENT_NAME, LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL } from "../../../constants"



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



export async function finish_login (session?: Session)
{
    // The process offered by Solid is terrible, buggy, does not work
    localStorage.setItem(LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL, window.location.toString())

    session = session || getDefaultSession()
    const logged_in = session.info.isLoggedIn

    await handleIncomingRedirect({ restorePreviousSession: true })
    localStorage.setItem(LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL, "")

    const logged_in_status_changed = logged_in !== session.info.isLoggedIn

    return logged_in_status_changed
}
