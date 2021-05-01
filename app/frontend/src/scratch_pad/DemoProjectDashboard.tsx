import { h, FunctionalComponent } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    knowledge_views: state.specialised_objects.knowledge_views
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
    </div>
}

export const DemoProjectDashboard = connector(_DemoProjectDashboard) as FunctionalComponent<{}>
