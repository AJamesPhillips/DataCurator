import { Button } from "@material-ui/core"
import { getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "../../common.scss"
import { ACTIONS } from "../../../state/actions"
import type { RootState } from "../../../state/State"
import { remove_index, replace_element } from "../../../utils/list"
import { AutoFillOIDC } from "./AutoFillOIDC"
import { finish_login, start_login } from "./handle_login"
import { PodProviderRow } from "./PodProviderRow"
import { OIDC_provider_map } from "./urls"
import { signout } from "../../../state/user_info/signout"
import { EditableTextSingleLine } from "../../../form/editable_text/EditableTextSingleLine"



interface OwnProps {
    on_close: () => void
}


const map_state = (state: RootState) =>
{
    return {
        user_name: state.user_info.user_name,
        using_solid: state.sync.use_solid_storage,
        solid_oidc_provider: state.user_info.solid_oidc_provider || OIDC_provider_map["inrupt.com"],
        default_solid_pod_URL: state.user_info.default_solid_pod_URL,
        custom_solid_pod_URLs: state.user_info.custom_solid_pod_URLs,
        chosen_custom_solid_pod_URL_index: state.user_info.chosen_custom_solid_pod_URL_index,
    }
}

const map_dispatch = {
    update_users_name: ACTIONS.user_info.update_users_name,
    set_used_storage_type: ACTIONS.sync.set_used_storage_type,
    update_solid_oidc_provider: ACTIONS.user_info.update_solid_oidc_provider,
    update_users_name_and_solid_pod_URL: ACTIONS.user_info.update_users_name_and_solid_pod_URL,
    update_custom_solid_pod_URLs: ACTIONS.user_info.update_custom_solid_pod_URLs,
    update_chosen_custom_solid_pod_URL_index: ACTIONS.user_info.update_chosen_custom_solid_pod_URL_index,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _UserAccountInfoForm (props: Props)
{
    const solid_session = getDefaultSession()
    const [logged_in, _set_logged_in] = useState(solid_session.info.isLoggedIn)
    const set_logged_in = () => _set_logged_in(solid_session.info.isLoggedIn)

    const { using_solid } = props

    if (using_solid)
    {
        // const started_logged_in = solid_session.info.isLoggedIn
        finish_login()
        .then(() =>
        {
            set_logged_in()
            // const changed_login_state = started_logged_in !== solid_session.info.isLoggedIn
            // if (!changed_login_state) return // defensive against infinite loops
            // get_solid_users_name_and_pod_URL().then(args => props.update_users_name_and_solid_pod_URL(args))
        })
    }


    const log_inout_label = logged_in ? "Logout" : "Login"


    return <div style={{ margin: 10 }}>
        <div className="section">
            {using_solid ? "User name" : "Set user name:"}&nbsp; &nbsp;
            <div style={{ width: 250, display: "inline-flex" }}>
                <EditableTextSingleLine
                    disabled={using_solid}
                    placeholder="User name"
                    value={props.user_name}
                    always_allow_editing={true}
                    select_all_on_focus={true}
                    conditional_on_change={user_name => props.update_users_name({ user_name })}
                />
            </div>

            <Button
                onClick={() => props.set_used_storage_type({ storage_type: "solid", using: !using_solid })}
            >
                {using_solid ? "Disable using" : "Or use"} Solid
            </Button>
        </div>


        {/* {using_solid && <div className="section"> */}


        {using_solid && <div className="section">
            Identity Provider (they allow you to prove who you are)&nbsp;
            <input
                type="text"
                style={{ width: 250 }}
                value={props.solid_oidc_provider}
                onBlur={e => props.update_solid_oidc_provider({ solid_oidc_provider: e.currentTarget.value })}
            />
            <br />
            &nbsp;&nbsp;
            Use:
            &nbsp;<AutoFillOIDC solid_oidc_provider_root="inrupt.com" />
            {/* &nbsp;<AutoFillOIDC solid_oidc_provider_root="solidcommunity.net" /> */}


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
                            await signout()
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

        </div>}

{/*
        <div className="section">
            Pod directory (where you want to get data from / save data to)

            <table>
            <tbody>


            <PodProviderRow
                solid_pod_URL_index={0}
                value={`Use default Pod directory ${quote_or_empty(props.default_solid_pod_URL)}`}
            />


            {props.custom_solid_pod_URLs.map((url, index) =>
            {
                const on_delete = url === props.default_solid_pod_URL ? undefined : () =>
                {
                    const custom_solid_pod_URLs = remove_index(props.custom_solid_pod_URLs, index)
                    props.update_custom_solid_pod_URLs({ custom_solid_pod_URLs })
                }

                return <PodProviderRow
                    solid_pod_URL_index={index + 1}
                    value={url}
                    on_change_value={value =>
                    {
                        const custom_solid_pod_URLs = replace_element(props.custom_solid_pod_URLs, value, url1 => url1 === url)
                        props.update_custom_solid_pod_URLs({ custom_solid_pod_URLs })
                    }}
                    on_delete={on_delete}
                />
            }
            )}


            <PodProviderRow
                on_change_value={() => {}}
                on_add={url =>
                {
                    const custom_solid_pod_URLs = [...props.custom_solid_pod_URLs, url]
                    props.update_custom_solid_pod_URLs({ custom_solid_pod_URLs })
                }}
            />


            </tbody>
            </table>
        </div> */}


        {logged_in && <div className="section" onClick={props.on_close}>
            <Button>Return to application</Button>
        </div>}

    </div>
}

export const UserAccountInfoForm = connector(_UserAccountInfoForm) as FunctionalComponent<OwnProps>



function quote_or_empty (str: string)
{
    return str ? `"${str}"` : ""
}
