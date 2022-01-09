import { ComponentClass, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { KnowledgeGraphView } from "../knowledge_view/KnowledgeGraphView"
import { ObjectivesView } from "../objectives/ObjectivesView"
import { PrioritiesListView } from "../priorities_list_view/PrioritiesListView"
import type { RootState } from "../state/State"
import { PrioritiesView } from "../priorities/PrioritiesView"
import { KnowledgeTimeView } from "../knowledge_view/KnowledgeTimeView"
import { ActionsListView } from "../actions_list_view/ActionsListView"



interface OwnProps {}


const map_state = (state: RootState) =>
{
    const { view } = state.routing.args
    const { display_by_simulated_time } = state.display_options

    return { view, display_by_simulated_time }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _MainAreaRouter (props: Props)
{
    let el = <div>
        Unsupported view: {props.view}
    </div>

    if (props.view === "knowledge")
    {
        if (props.display_by_simulated_time) el = <KnowledgeTimeView />
        else el = <KnowledgeGraphView />
    }
    else if (props.view === "objectives") el = <ObjectivesView />
    else if (props.view === "priorities") el = <PrioritiesView />
    else if (props.view === "priorities_list") el = <PrioritiesListView />
    else if (props.view === "actions_list") el = <ActionsListView />

    return el
}

export const MainAreaRouter = connector(_MainAreaRouter) as ComponentClass<OwnProps>
