import { Session, handleIncomingRedirect } from "@inrupt/solid-client-authn-browser"
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



export async function finish_login ()
{
    await handleIncomingRedirect({ restorePreviousSession: true })
}
