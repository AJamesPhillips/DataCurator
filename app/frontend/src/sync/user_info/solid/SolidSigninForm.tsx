import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { getDefaultSession, handleIncomingRedirect, Session } from "@inrupt/solid-client-authn-browser"

import "../../common.scss"
import type { RootState } from "../../../state/State"
import { ACTIONS } from "../../../state/actions"
import { AutoFillOIDC } from "./AutoFillOIDC"
import { CLIENT_NAME } from "../../../constants"
import { useState } from "preact/hooks"



interface OwnProps {}


const map_state = (state: RootState) =>
{
    return {
        solid_oidc_provider: state.user_info.solid_oidc_provider,
    }
}

const map_dispatch = {
    update_solid_oidc_provider: ACTIONS.user_info.update_solid_oidc_provider,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _SolidSigninForm (props: Props)
{
    const solid_session = getDefaultSession()
    const [logged_in, _set_logged_in] = useState(solid_session.info.isLoggedIn)
    const set_logged_in = () => _set_logged_in(solid_session.info.isLoggedIn)

    finish_login(solid_session).then(() => set_logged_in())


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
        </div>


        {props.solid_oidc_provider && !logged_in && <div className="section">
            Login to solid:&nbsp;
            <button onClick={e =>
                {
                    e.stopImmediatePropagation()
                    start_login(solid_session, props.solid_oidc_provider)
                }}
            >
                Login
            </button>
        </div>}


        {props.solid_oidc_provider && logged_in && <div className="section">
            Logout of Solid:&nbsp;
            <button onClick={async (e) =>
                {
                    e.stopImmediatePropagation()
                    await solid_session.logout()
                    set_logged_in()
                }}
            >
                Logout
            </button>
        </div>}


        {/*
        <StorageOption
            name={get_storage_type_name("local_storage")}
            description={<div>
                The data is stored in your web browser. It never leaves your web browser. It is not available
                in other web browsers, or on other computers. If you work in an incognito window you data will
                be lost. If you clear your cache &amp; cookies your data will be lost. We recommend using this
                for temporary demos <s>or if you are going to export to a file and reimport it after every
                use</s> [feature not supported yet].
            </div>}
            selected={storage_type === "local_storage"}
            on_click={() => set_storage_type("local_storage")}
        />


        <StorageOption
            name={get_storage_type_name("solid")}
            description={<div>
                Solid is a data storage platform which puts you back in control of your
                data.  Once you retake ownership of your own data it enables you to use your data
                with any other application and do useful things;
                something the big tech companies don't let you do.
                Sign up for a free account here:
                &nbsp; <a href="https://solidcommunity.net/" target="_blank">solidcommunity.net</a>
                &nbsp; or here:
                &nbsp; <a href="https://signup.pod.inrupt.com/" target="_blank">inrupt.com</a>
            </div>}
            selected={storage_type === "solid"}
            on_click={() => set_storage_type("solid")}
        />


        <div
            className="storage_option_section advanced_options_title"
            onClick={() => set_show_advanced(!show_advanced)}
        >
            <span style={{ fontSize: 10 }}>{show_advanced ? "\u25BC" : "\u25B6"}</span>
            &nbsp;{show_advanced ? "Hide" : "Show"} advanced options
        </div>


        {show_advanced && <StorageOption
            name={get_storage_type_name("local_server")}
            description={<div>
                You will need to be running your local Data Curator server at localhost:4000 to use this option successfully. If you choose this option we assume you know what you are doing and have a copy of the code base. If not, please contact {CONTACT_EMAIL_ADDRESS_TAG}
            </div>}
            selected={storage_type === "local_server"}
            on_click={() => set_storage_type("local_server")}
        />}


        {(show_warning || show_danger_warning) && <div
            className={`storage_option_section ${show_warning ? "warning" : "danger"}`}
        >
            <WarningTriangle message="" backgroundColor={show_warning ? "" : "red"} />&nbsp;
            Swapping to a new data store ({new_storage_name}) will leave behind your
            current data (in {initial_storage_name}).
            To copy your current data to the new storage location please check this box

            &nbsp;<input type="checkbox" checked={copy_data} onClick={e =>
            {
                e.stopImmediatePropagation()
                set_copy_data(!copy_data)
            }} />&nbsp;

            {show_danger_warning && <div>
                DANGER: you may overwrite some or all of the current data
                in '{new_storage_name}' with the data in '{initial_storage_name}'.
            </div>}
        </div>}


        <ButtonGroup size="small" color="primary" variant="contained" fullWidth={true}  disableElevation={true}>
            {show_single_confirm_button && <Button
                value="Confirm"
                onClick={e =>
                {
                    e.stopImmediatePropagation()
                    storage_type && props.update_storage_type(storage_type)
                    props.on_close()
                }}
            />}


            {show_double_confirm_button && <ConfirmatoryButton
                button_text="Confirm"
                on_click={() =>
                {
                    storage_type && props.update_storage_type(storage_type)
                    props.on_close()
                }}
            />}


            {valid_storage_type && <Button
                value="Cancel"
                onClick={e =>
                {
                    e.stopImmediatePropagation()
                    props.on_close()
                }}
            />}
        </ButtonGroup> */}

    </div>
}

export const SolidSigninForm = connector(_SolidSigninForm) as FunctionalComponent<OwnProps>



function start_login (session: Session, oidcIssuer: string)
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



async function finish_login (session: Session)
{
    await handleIncomingRedirect({ restorePreviousSession: true })
}
