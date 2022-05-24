import "./shared/utils/monkey_patch"
import "./index.scss"
import App from "./App"

import { h, render } from "preact"
import "preact/devtools"
import { Provider } from "react-redux"

import { get_store } from "./state/store"
import { DemoPredictionsGraph } from "./scratch_pad/PredictionsGraph"
import { DemoPredictionsBadge } from "./scratch_pad/DemoPredictionsBadge"
import { SandBox } from "./scratch_pad/SandBox"
import { SandboxEditableCustomDateTime } from "./scratch_pad/SandboxEditableCustomDateTime"
import { DemoProjectDashboard } from "./scratch_pad/DemoProjectDashboard"
import { SandboxWComponentCanvasNode } from "./scratch_pad/SandboxWComponentCanvasNode"
import { SandBoxConnected } from "./scratch_pad/SandBoxConnected"
import { SandBoxSupabase } from "./scratch_pad/SandBoxSupabase"
import { setup_window_on_focus_listener } from "./utils/window_on_focus_listener"
import { DevLandingPage } from "./home/DevLandingPage"
import { SimHome } from "./x_sim_app/SimHome"
import { setup_console_api } from "./x_console_api_app/setup_console_api"
import { set_window_title } from "./window_title/set_window_title"
import { SandboxCircularConnections } from "./scratch_pad/SandboxCircularConnections"
import { DataApp } from "./x_data_app/DataApp"
import { get_data_app_store } from "./x_data_app/state/get_data_app_store"



const root = document.getElementById("root")


if (root)
{
    root.innerText = ""

    if (window.location.pathname === "" || window.location.pathname === "/")
    {
        render(<DevLandingPage />, root)
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
    else if (window.location.pathname === "/sandbox/editable_custom_datetime")
    {
        render(<Provider store={get_store({ load_state_from_storage: false })}><SandboxEditableCustomDateTime /></Provider>, root)
    }
    else if (window.location.pathname === "/sandbox/canvas_nodes")
    {
        render(<SandboxWComponentCanvasNode />, root)
    }
    else if (window.location.pathname === "/sandbox/circular_connections")
    {
        render(<SandboxCircularConnections />, root)
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

    else if (window.location.pathname === "/privacy-policy")
    {
        render(<div>Will render public/privacy-policy.html</div>, root)
    }
    else if (window.location.pathname === "/privacy-policy/")
    {
        render(<div>Will need to remove trailing / and link to privacy-policy or privacy-policy.html to render correctly</div>, root)
    }

    else if (window.location.pathname === "/terms-and-conditions")
    {
        render(<div>Will render public/terms-and-conditions.html</div>, root)
    }
    else if (window.location.pathname === "/terms-and-conditions/")
    {
        render(<div>Will need to remove trailing / and link to terms-and-conditions or terms-and-conditions.html to render correctly</div>, root)
    }

    else if (window.location.pathname === "/sim/" || window.location.pathname === "/sim")
    {
        render(<SimHome />, root)
    }
    else if (window.location.pathname === "/data/" || window.location.pathname === "/data")
    {
        const store = get_data_app_store({ load_state_from_storage: false })
        render(<Provider store={store}><DataApp /></Provider>, root)
    }
    else
    {
        root.innerText = ("Unknown path: " + window.location.pathname)
    }
}


set_window_title()
setup_window_on_focus_listener()
setup_console_api()
