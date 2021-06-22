import { h } from "preact"

import "./App.css"
import { MainAreaRouter } from "./layout/MainAreaRouter"
import { TabsContainer } from "./layout/TabsContainer"
import { SidePanel } from "./side_panel/SidePanel"
import { ViewsBreadcrumb } from "./views/ViewsBreadcrumb"

function App() {

  return (
    <div className="App">
	    <ViewsBreadcrumb />
      <MainAreaRouter />
      <div id="side_panel">
        <TabsContainer content_changed={() => {}} />
        <div id="side_panel_content"><SidePanel /></div>
      </div>
    </div>
  )
}

export default App
