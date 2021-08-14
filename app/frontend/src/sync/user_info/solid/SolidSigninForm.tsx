import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { getDefaultSession } from "@inrupt/solid-client-authn-browser"

import "../../common.scss"
import type { RootState } from "../../../state/State"
import { ACTIONS } from "../../../state/actions"
import { AutoFillOIDC } from "./AutoFillOIDC"
import { useState } from "preact/hooks"
import { Button } from "../../../sharedf/Button"
import { get_solid_username } from "./get_solid_username"
import { finish_login, start_login } from "./handle_login"



interface OwnProps {
    on_close: () => void
}


const map_state = (state: RootState) =>
{
    return {
        solid_oidc_provider: state.user_info.solid_oidc_provider,
        user_name: state.user_info.user_name,
    }
}

const map_dispatch = {
    update_solid_oidc_provider: ACTIONS.user_info.update_solid_oidc_provider,
    update_user_name_from_solid: ACTIONS.user_info.update_user_name_from_solid,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _SolidSigninForm (props: Props)
{
    const solid_session = getDefaultSession()
    const [logged_in, _set_logged_in] = useState(solid_session.info.isLoggedIn)
    const set_logged_in = () => _set_logged_in(solid_session.info.isLoggedIn)

    finish_login(solid_session).then(logged_in_status_changed =>
    {
        if (logged_in_status_changed) update_user_name(props.update_user_name_from_solid)
        set_logged_in()
    })


    const log_inout_label = logged_in ? "Logout" : "Login"


    return <div style={{ margin: 10 }}>
        <div className="section">
            OIDC Provider&nbsp;
            <input
                type="text"
                style={{ width: 250 }}
                value={props.solid_oidc_provider}
                onBlur={e => props.update_solid_oidc_provider({ solid_oidc_provider: e.currentTarget.value })}
            />

            &nbsp;&nbsp;
            Use:
            &nbsp;<AutoFillOIDC solid_oidc_provider_root="solidcommunity.net" />
            &nbsp;<AutoFillOIDC solid_oidc_provider_root="inrupt.com" />


            {logged_in && <div>
                <br />

                You are signed in as: <a
                    href={solid_session.info.webId}
                    target="_blank"
                >
                    {solid_session.info.webId}
                </a>
                &nbsp; with user name: {props.user_name}
            </div>}


            {props.solid_oidc_provider && <div>
                <br />

                {log_inout_label} {logged_in ? "of" : "to"} Solid:&nbsp;
                <button onClick={async (e) =>
                    {
                        e.stopImmediatePropagation()

                        if (logged_in)
                        {
                            await solid_session.logout()
                            set_logged_in()
                        }
                        else
                        {
                            start_login(solid_session, props.solid_oidc_provider)
                        }
                    }}
                >
                    {log_inout_label}
                </button>
            </div>}

        </div>


        {logged_in && <div className="section" onClick={props.on_close}>
            <Button>Return to application</Button>
        </div>}

    </div>
}

export const SolidSigninForm = connector(_SolidSigninForm) as FunctionalComponent<OwnProps>



async function update_user_name (update_user_name_from_solid: (args: { user_name_from_solid: string }) => void)
{
    const user_name_from_solid = (await get_solid_username()) || ""

    update_user_name_from_solid({ user_name_from_solid })
}
