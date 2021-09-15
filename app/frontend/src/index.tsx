import "./index.scss"
import App from "./App"
import "./shared/utils/monkey_patch"

import { h, render } from "preact"
import "preact/devtools"
import { Provider } from "react-redux"

import { APP_DETAILS } from "./shared/constants"
import { get_store } from "./state/store"
import { DemoPredictionsGraph } from "./scratch_pad/PredictionsGraph"
import { DemoStatementProbability } from "./statements/StatementWithProbability"
import { DemoStatementProbabilityExplorer } from "./statements/StatementProbabilityExplorer"
import { DemoPredictionsBadge } from "./scratch_pad/DemoPredictionsBadge"
import { SandBox } from "./scratch_pad/SandBox"
import { SandboxEditableCustomDateTime } from "./scratch_pad/SandboxEditableCustomDateTime"
import { DemoProjectDashboard } from "./scratch_pad/DemoProjectDashboard"
import { SandboxWComponentCanvasNode } from "./scratch_pad/SandboxWComponentCanvasNode"
import { SandBoxConnected } from "./scratch_pad/SandBoxConnected"
import { correct_path, finish_login } from "./sync/user_info/solid/handle_login"
import { getDefaultSession, onSessionRestore } from "@inrupt/solid-client-authn-browser"
import { onload_is_using_solid_for_storage } from "./state/sync/persistance"
import { get_solid_users_name_and_pod_URL } from "./sync/user_info/solid/get_solid_username"
import { OIDC_provider_map } from "./sync/user_info/solid/urls"
import type { UserInfoState } from "./state/user_info/state"
import { get_persisted_state_object, persist_state_object } from "./state/persistence/persistence_utils"
import { find_match_by_inclusion_of_key } from "./utils/object"
import { SandBoxSolid } from "./scratch_pad/SandBoxSolid"
import { ERRORS } from "./shared/errors"



const root = document.getElementById("root")
const title = document.getElementsByTagName("title")[0]


if (root)
{
    const in_production = window.location.hostname.endsWith("datacurator.org")

    if (window.location.pathname === "" || window.location.pathname === "/")
    {
        let content = `
        <style>
            .alpha {
                color: #A00;
                vertical-align: super;
                font-size: small;
            }
        </style>

        <h1>DataCurator <span class="alpha">Alpha</span></h1>

        <div>
            <h4>Welcome</h4>
        </div>

        <div>
            To get started go to <a href="/app/">/app</a> to create your first knowledge component.
        </div>

        <!--div>
            For more info see <a href="https://github.com/CenterOfCI/datacurator2">the repository on GitHub</a> containing the code.
        </div-->

        <br>
        `

        if (!in_production)
        {
            content = `<ul>
            <li><a href="/app/">app</a></li>
            <li><a href="/project_dashboard">Project dashboard</a></li>
            <li><a href="/prob_graph">Probability graph</a></li>
            <li><a href="/prob_badge">Probability badge</a></li>
            <li><a href="/statement_probability">Statement probability</a></li>
            <li><a href="/statement_probability_explorer">Statement probability explorer</a></li>
            <li><a href="/sandbox/editable_custom_datetime">Sandbox - EditableCustomDateTime</a></li>
            <li><a href="/sandbox/canvas_nodes">Sandbox - WComponentNode</a></li>
            <li><a href="/sandbox/solid">Sandbox - Solid</a></li>
            <li><a href="/sandbox">Sandbox</a></li>
            </ul>`
        }

        root.innerHTML = content
    }
    else if (window.location.pathname === "/project_dashboard")
    {
        render(<Provider store={get_store({ load_state_from_storage: true })}><DemoProjectDashboard /></Provider>, root)
    }
    else if (window.location.pathname === "/prob_graph")
    {
        render(<DemoPredictionsGraph />, root)
    }
    else if (window.location.pathname === "/prob_badge")
    {
        render(<DemoPredictionsBadge />, root)
    }
    else if (window.location.pathname === "/statement_probability")
    {
        render(<Provider store={get_store({ load_state_from_storage: true })}><DemoStatementProbability /></Provider>, root)
    }
    else if (window.location.pathname === "/statement_probability_explorer")
    {
        render(<Provider store={get_store({ load_state_from_storage: true })}><DemoStatementProbabilityExplorer /></Provider>, root)
    }
    else if (window.location.pathname === "/sandbox/editable_custom_datetime")
    {
        render(<Provider store={get_store({ load_state_from_storage: false })}><SandboxEditableCustomDateTime /></Provider>, root)
    }
    else if (window.location.pathname === "/sandbox/canvas_nodes")
    {
        render(<SandboxWComponentCanvasNode />, root)
    }
    else if (window.location.pathname === "/sandbox/connected")
    {
        render(<Provider store={get_store({ load_state_from_storage: false })}><SandBoxConnected /></Provider>, root)
    }
    else if (window.location.pathname === "/sandbox/solid")
    {
        restore_session(root)
        .then(() =>
        {
            render(<SandBoxSolid />, root)
        })
    }
    else if (window.location.pathname === "/sandbox")
    {
        render(<SandBox />, root)
    }
    else if (window.location.pathname === "/app/" || window.location.pathname === "/app")
    {
        restore_session(root)
        .then(() =>
        {
            const store = get_store({ load_state_from_storage: true })
            render(<Provider store={store}><App /></Provider>, root)
        })
    }
    else
    {
        root.innerText = ("Unknown path: " + window.location.pathname)
    }
}


if (title)
{
    title.innerHTML = APP_DETAILS.NAME
}



// TODO move this function somewhere else
function restore_session (root_el: HTMLElement): Promise<void>
{
    const using_solid_for_storage = onload_is_using_solid_for_storage()

    if (using_solid_for_storage)
    {
        root_el.innerHTML = "Requesting Solid login session..."

        // See https://github.com/inrupt/solid-client-authn-js/issues/1473#issuecomment-902808449
        onSessionRestore(url => {
            console .log("onSessionRestore url ", url)
            if (document.location.toString() !== url)
            {
                if (document.location.pathname !== new URL(url).pathname) document.location.href = url
                else history.replaceState(null, "", url)
            }
        })


        console .log("starting `restore_session` at " + document.location.toString())


        return correct_path()
        .then(() => finish_login())
        .then(() => get_solid_users_name_and_pod_URL())
        // This whole function has a smell
        .then(args =>
        {
            console .log(`Signed in as user name: "${args.user_name}"`)

            const solid_session = getDefaultSession()
            let solid_oidc_provider = (
                // Will be something like `https://<user name>.solidcommunity.net/profile/card#me`
                solid_session.info.webId
                // Will be something like `https://solidcommunity.net`
                || (get_persisted_state_object<UserInfoState>("user_info").solid_oidc_provider)
                || ""
            )

            const match = find_match_by_inclusion_of_key(solid_oidc_provider, OIDC_provider_map)
            solid_oidc_provider = match ? match[1] : ""

            const partial_user_info: Partial<UserInfoState> = {
                ...get_persisted_state_object<UserInfoState>("user_info"),
                ...args,
                solid_oidc_provider,
            }

            persist_state_object("user_info", partial_user_info)

            console .log("Persisted user_info: ", get_persisted_state_object("user_info"))
        })
        .catch(err =>
        {
            if (err === ERRORS.NOT_LOGGED_IN || err === ERRORS.NO_SOLID_WEB_ID) return console .log("restore_session " + err)
            console.error("Error restoring session: ", err)
        })
        .finally(() =>
        {
            root_el.innerHTML = ""
        })
    }


    return Promise.resolve()
}
