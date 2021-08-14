import { Session, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser"
import { CLIENT_NAME } from "../../../constants"



export function start_login (session: Session, oidcIssuer: string)
{
    if (oidcIssuer && !session.info.isLoggedIn)
    {
        session.login({
            oidcIssuer,
            clientName: CLIENT_NAME,
            redirectUrl: window.location.href,
        });
    }
}



export async function finish_login (session: Session)
{
    const logged_in = session.info.isLoggedIn

    await handleIncomingRedirect({ restorePreviousSession: true })

    const logged_in_status_changed = logged_in !== session.info.isLoggedIn

    return logged_in_status_changed
}
