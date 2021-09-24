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
import { SandBoxSupabase } from "./scratch_pad/SandBoxSupabase"



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
            <li><a href="/sandbox/supabase">Sandbox - Supabase</a></li>
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
    else if (window.location.pathname === "/sandbox/supabase")
    {
        render(<SandBoxSupabase />, root)
    }
    else if (window.location.pathname === "/sandbox")
    {
        render(<SandBox />, root)
    }
    else if (window.location.pathname === "/app/" || window.location.pathname === "/app")
    {
        const store = get_store({ load_state_from_storage: true })
        render(<Provider store={store}><App /></Provider>, root)
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
