import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { WComponentJudgement } from "../shared/models/interfaces/judgement"
import type { RootState } from "../state/State"
import { ProjectJudgementEntry } from "./ProjectJudgementEntry"



interface OwnProps
{
    knowledge_view_id: string
}


const map_state = (state: RootState, { knowledge_view_id }: OwnProps) => ({
    judgements: state.specialised_objects.wcomponent_ids_by_type.judgement,
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    knowledge_view: state.specialised_objects.knowledge_views.find(({ id }) => id === knowledge_view_id)
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


const _ProjectDashboard = (props: Props) =>
{
    const { knowledge_view } = props
    if (!knowledge_view) return <div>Can not find Knowledge view of id: {props.knowledge_view_id}</div>

    const ids_in_kv = Object.keys(knowledge_view.wc_id_map)
    const judgements: WComponentJudgement[] = ids_in_kv.filter(id => props.judgements.has(id))
        .map(id => props.wcomponents_by_id[id] as WComponentJudgement)
        .filter(wc => !!wc)
        .sort((j1, j2) => j1.judgement_target_wcomponent_id < j2.judgement_target_wcomponent_id ? -1 : (
            j1.judgement_target_wcomponent_id > j2.judgement_target_wcomponent_id ? 1 : 0
        ))

    const ms = new Date().getTime()

    return <div style={{ display: "flex", flexDirection: "column" }}>
        {judgements.map(judgement => <ProjectJudgementEntry
            knowledge_view={knowledge_view} judgement={judgement} created_at_ms={ms} sim_ms={ms}
        />)}
    </div>
}

export const ProjectDashboard = connector(_ProjectDashboard) as FunctionalComponent<OwnProps>
