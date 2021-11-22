import "./shared/utils/monkey_patch"
import "./index.scss"
import App from "./App"

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
import { setup_window_on_focus_listener } from "./utils/window_on_focus_listener"
import { LandingPage } from "./home/LandingPage"
import { DevLandingPage } from "./home/DevLandingPage"
import { SimHome } from "./x_sim_app/SimHome"
import { setup_console_api } from "./x_console_api_app/setup_console_api"
import { set_window_title } from "./window_title"


const root = document.getElementById("root")


if (root)
{
    root.innerText = ""

    const in_production = window.location.hostname === "datacurator.org"
    if (window.location.pathname === "" || window.location.pathname === "/")
    {
        if (in_production) {
            render(<LandingPage />, root)
        } else {
            render(<DevLandingPage />, root)
        }
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
    else if (window.location.pathname === "/sim/" || window.location.pathname === "/sim")
    {
        render(<SimHome />, root)
    }
    else
    {
        root.innerText = ("Unknown path: " + window.location.pathname)
    }
}


set_window_title()
setup_window_on_focus_listener()
setup_console_api()
