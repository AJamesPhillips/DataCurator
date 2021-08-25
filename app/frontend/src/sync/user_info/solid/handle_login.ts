import { Session, handleIncomingRedirect, getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { CLIENT_NAME } from "../../../constants"



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



export async function finish_login (session?: Session)
{
    session = session || getDefaultSession()
    const logged_in = session.info.isLoggedIn

    await handleIncomingRedirect({ restorePreviousSession: true })

    const logged_in_status_changed = logged_in !== session.info.isLoggedIn

    return logged_in_status_changed
}
