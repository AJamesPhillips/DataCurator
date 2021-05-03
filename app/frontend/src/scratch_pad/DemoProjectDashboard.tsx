import { h, FunctionalComponent } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { ProjectDashboard } from "./ProjectDashboard"



const map_state = (state: RootState) => ({
    knowledge_views: state.derived.knowledge_views
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>


const _DemoProjectDashboard = (props: Props) =>
{
    const [selected_knowledge_view, select_knowledge_view] = useState<string | undefined>(undefined)

    return <div>
        DemoProjectDashboard

        {props.knowledge_views.map(kv =>
        {
            return <div
                onClick={() => select_knowledge_view(kv.id)}
                style={{
                    fontWeight: kv.id === selected_knowledge_view ? "bold" : "initial",
                    cursor: "pointer",
                }}
            >
                {kv.title}
            </div>
        })}

        {selected_knowledge_view && <div>
            <hr />
            <ProjectDashboard knowledge_view_id={selected_knowledge_view} />
        </div>}

    </div>
}

export const DemoProjectDashboard = connector(_DemoProjectDashboard) as FunctionalComponent<{}>
