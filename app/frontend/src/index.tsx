import "./shared/utils/monkey_patch"

import { h, render } from "preact"
import "preact/devtools"
import { Provider } from "react-redux"

import App from "./App"
import "./index.css"
import { APP_DETAILS } from "./shared/constants"
import { config_store } from "./state/store"
import { DemoPredictionsGraph } from "./scratch_pad/PredictionsGraph"
import { DemoStatementProbability } from "./statements/StatementWithProbability"
import { DemoStatementProbabilityExplorer } from "./statements/StatementProbabilityExplorer"
import { DemoPredictionsBadge } from "./scratch_pad/DemoPredictionsBadge"
import { SandBox } from "./scratch_pad/SandBox"
import { SandboxEditableCustomDateTime } from "./scratch_pad/SandboxEditableCustomDateTime"
import { DemoProjectDashboard } from "./scratch_pad/DemoProjectDashboard"

const root = document.getElementById("root")
const title = document.getElementsByTagName("title")[0]

if (root) {
  if (document.location.pathname === "/")
  {
    root.innerHTML = `<ul>
    <li><a href="/app">app</a></li>
    <li><a href="/project_dashboard">Project dashboard</a></li>
    <li><a href="/prob_graph">Probability graph</a></li>
    <li><a href="/prob_badge">Probability badge</a></li>
    <li><a href="/statement_probability">Statement probability</a></li>
    <li><a href="/statement_probability_explorer">Statement probability explorer</a></li>
    <li><a href="/sandbox/editable_custom_datetime">Sandbox - EditableCustomDateTime</a></li>
    <li><a href="/sandbox">Sandbox</a></li>
    </ul>`
  }
  else if (document.location.pathname === "/project_dashboard")
  {
    render(<Provider store={config_store({ load_state_from_server: true })}><DemoProjectDashboard /></Provider>, root)
  }
  else if (document.location.pathname === "/prob_graph")
  {
    render(<DemoPredictionsGraph />, root)
  }
  else if (document.location.pathname === "/prob_badge")
  {
    render(<DemoPredictionsBadge />, root)
  }
  else if (document.location.pathname === "/statement_probability")
  {
    render(<Provider store={config_store({ load_state_from_server: true })}><DemoStatementProbability /></Provider>, root)
  }
  else if (document.location.pathname === "/statement_probability_explorer")
  {
    render(<Provider store={config_store({ load_state_from_server: true })}><DemoStatementProbabilityExplorer /></Provider>, root)
  }
  else if (document.location.pathname === "/sandbox/editable_custom_datetime")
  {
    render(<Provider store={config_store({ load_state_from_server: false })}><SandboxEditableCustomDateTime /></Provider>, root)
  }
  else if (document.location.pathname === "/sandbox")
  {
    render(<SandBox />, root)
  }
  else
  {
    render(<Provider store={config_store({ load_state_from_server: true })}><App /></Provider>, root)
  }
}

if (title) {
  title.innerHTML = APP_DETAILS.NAME
}
