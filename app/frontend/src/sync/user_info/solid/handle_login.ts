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
        console .log("Logging into solid session with: ", JSON.stringify(args))
        session.login(args)
    }
}



// This is only needed to copy with redirecting logins between two different applications
export async function correct_path ()
{
    const url = localStorage.getItem(LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL)
    if (!url) return console .log("`correct_path` has no url")

    const url_object = new URL(url)

    if (document.location.pathname === url_object.pathname)
    {
        return console .log("`correct_path` paths match", document.location.pathname, url)
    }

    const new_url = new URL(document.location.href)
    new_url.pathname = url_object.pathname
    console .log(`\`correct_path\` changing location from "${document.location.toString()}" to "${new_url.toString()}"`)
    document.location.href = new_url.toString()

    return Promise.reject()
}



export async function finish_login ()
{
    // The process offered by Solid is terrible, buggy, does not work
    localStorage.setItem(LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL, window.location.toString())

    await handleIncomingRedirect({ restorePreviousSession: true })
    console .log("-finish_login finished login")
    localStorage.setItem(LOCAL_STORAGE_KEY__SOLID_SESSION_RESTORE_URL, "")
}
