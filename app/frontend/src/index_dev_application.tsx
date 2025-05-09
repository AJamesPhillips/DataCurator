import "./index.scss"
import "./shared/utils/monkey_patch"

import { render } from "preact"
import "preact/devtools"
import { Provider } from "react-redux"

import { DemoPredictionsBadge } from "./scratch_pad/DemoPredictionsBadge"
import { DemoProjectDashboard } from "./scratch_pad/DemoProjectDashboard"
import { DemoPredictionsGraph } from "./scratch_pad/PredictionsGraph"
import { SandBox } from "./scratch_pad/SandBox"
import { SandboxCircularConnections } from "./scratch_pad/SandboxCircularConnections"
import { SandBoxConnected } from "./scratch_pad/SandBoxConnected"
import { SandboxEditableCustomDateTime } from "./scratch_pad/SandboxEditableCustomDateTime"
import { SandBoxSupabase } from "./scratch_pad/SandBoxSupabase"
import { SandboxWComponentCanvasNode } from "./scratch_pad/SandboxWComponentCanvasNode"
import { get_store } from "./state/store"
import { DataApp } from "./x_data_app/DataApp"
import { get_data_app_store } from "./x_data_app/state/get_data_app_store"
import { SimHome } from "./x_sim_app/SimHome"



const root = document.getElementById("root")


const map_request_to_app: {[index: string]: () => JSX.Element} = {
    "project_dashboard": () =>
    {
        const store = get_store({ load_state_from_storage: true })
        return <Provider store={store}><DemoProjectDashboard /></Provider>
    },
    "prob_graph": () => <DemoPredictionsGraph />,
    "prob_badge": () => <DemoPredictionsBadge />,
    "sandbox/editable_custom_datetime": () =>
    {
        const store = get_store({ load_state_from_storage: false })
        return <Provider store={store}>
            <SandboxEditableCustomDateTime />
        </Provider>
    },
    "sandbox/canvas_nodes": () => <SandboxWComponentCanvasNode />,
    "sandbox/circular_connections": () => <SandboxCircularConnections />,
    "sandbox/connected": () =>
    {
        const store = get_store({ load_state_from_storage: false })
        return <Provider store={store}><SandBoxConnected /></Provider>
    },
    "sandbox/supabase": () => <SandBoxSupabase />,
    "sandbox": () => <SandBox />,
    "sim": () => <SimHome />,
    "data": () =>
    {
        const store = get_data_app_store({ load_state_from_storage: false })
        return <Provider store={store}><DataApp /></Provider>
    }
}


if (root)
{
    root.innerText = ""


    let jsx: (() => JSX.Element) | null = map_request_to_app[window.location.search.slice(1)] || null

    if (!jsx)
    {
        jsx = () => <div>
            Supported dev apps:
            <ul>
                {Object.keys(map_request_to_app).map((key) => <li>
                    <a href={`?${key}`}>{key}</a>
                </li>)}
            </ul>
        </div>
    }

    render(jsx(), root)
}
