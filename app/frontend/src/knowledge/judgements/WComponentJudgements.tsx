import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./WComponentJudgements.css"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../../state/State"
import { JudgementBadgeC } from "./JudgementBadgeC"



interface OwnProps
{
    wcomponent: WComponent
}



const map_state = (state: RootState, own_props: OwnProps) => {
    const judgement_or_objective_ids = [
        ...(state.derived.judgement_or_objective_ids_by_target_id[own_props.wcomponent.id] || []),
        ...(state.derived.judgement_or_objective_ids_by_goal_id[own_props.wcomponent.id] || []),
    ]

    return {
        judgement_or_objective_ids,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentJudgements (props: Props)
{
    const { judgement_or_objective_ids: ids } = props
    const node_judgements_container_class_name = "node_judgements_container " + (ids.length ? "" : "empty")

    return <div className={node_judgements_container_class_name}>
        {ids.map(id => <JudgementBadgeC judgement_or_objective_id={id} />)}
    </div>
}

export const WComponentJudgements = connector(_WComponentJudgements) as FunctionalComponent<OwnProps>
