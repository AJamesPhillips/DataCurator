import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { KnowledgeContentControls } from "../knowledge_view/KnowledgeContentControls"
import { PrioritiesContentControls } from "../priorities/PrioritiesContentControls"
import type { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    view: state.routing.args.view,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _MainContentControls (props: Props)
{
    const { view } = props

    return <div className="main_content_controls">
        {view === "knowledge" && <KnowledgeContentControls />}
        {view === "priorities" && <PrioritiesContentControls />}
    </div>
}


export const MainContentControls = connector(_MainContentControls) as FunctionalComponent
