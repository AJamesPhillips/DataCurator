import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ActionsListView } from "../actions_list_view/ActionsListView"
import { KnowledgeGraphView } from "../knowledge_view/KnowledgeGraphView"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
{
    const { view } = state.routing.args

    return { view }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


function _MainAreaRouter (props: Props)
{
    let el = <div>
        Unsupported view: {props.view}
    </div>

    if (props.view === "knowledge")
    {
        el = <KnowledgeGraphView />
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    else if (props.view === "actions_list") el = <ActionsListView />

    return el
}

export const MainAreaRouter = connector(_MainAreaRouter) as FunctionalComponent
