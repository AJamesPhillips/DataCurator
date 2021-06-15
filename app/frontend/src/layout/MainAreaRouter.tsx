import { ComponentClass, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { KnowledgeView } from "../knowledge_view/KnowledgeView"
import { ObjectivesView } from "../objectives/ObjectivesView"
import { PrioritiesListView } from "../priorities_list_view/PrioritiesListView"
import { PrioritiesView } from "../priorities/PrioritiesView"
import type { RootState } from "../state/State"


interface OwnProps {}


const map_state = (state: RootState) =>
{
    const view = state.routing.args.view

    return { view }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _MainAreaRouter (props: Props)
{
    if (props.view === "knowledge") return <KnowledgeView />
    if (props.view === "objectives") return <ObjectivesView />
    if (props.view === "priorities") return <PrioritiesView />
    if (props.view === "priorities_list") return <PrioritiesListView />
    return <div>Unsupported view: {props.view}</div>
}

export const MainAreaRouter = connector(_MainAreaRouter) as ComponentClass<OwnProps>
