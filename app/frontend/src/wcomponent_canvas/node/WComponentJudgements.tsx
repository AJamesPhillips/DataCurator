import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { useMemo } from "preact/hooks"
import { JudgementBadgeConnected } from "../../sharedf/judgement_badge/JudgementBadgeConnected"
import { JudgementBadgeSimple } from "../../sharedf/judgement_badge/JudgementBadgeSimple"
import { get_current_composed_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import type { ParsedValue } from "../../wcomponent_derived/interfaces/value"
import "./WComponentJudgements.css"



type OwnProps =
{
    wcomponent: WComponent
    target_VAPs_represent?: undefined
    value?: undefined
    hide_judgement_trend: boolean
}
| {
    wcomponent: WComponent
    target_VAPs_represent: VAPsType
    value: ParsedValue
    hide_judgement_trend: boolean
}



const map_state = (state: RootState) =>
{
    const current_composed_kv = get_current_composed_knowledge_view_from_state(state)

    return {
        active_judgement_or_objective_ids_by_target_id: current_composed_kv?.active_judgement_or_objective_ids_by_target_id,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentJudgements (props: Props)
{
    const {
        active_judgement_or_objective_ids_by_target_id,
        target_VAPs_represent, value,
    } = props


    const judgement_or_objective_ids = useMemo(() =>
    {
        return [
            ...((active_judgement_or_objective_ids_by_target_id || {})[props.wcomponent.id] || []),
        ]
    }, [
        active_judgement_or_objective_ids_by_target_id,
    ])


    const node_judgements_container_class_name = "node_judgements_container "

    if (value === undefined || target_VAPs_represent === undefined)
    {
        return <div className={node_judgements_container_class_name}>
            {judgement_or_objective_ids.map(id => <JudgementBadgeConnected
                judgement_or_objective_id={id}
                hide_judgement_trend={props.hide_judgement_trend}
            />)}
        </div>
    }

    return <div className={node_judgements_container_class_name}>
        {judgement_or_objective_ids.map(id => <JudgementBadgeSimple
            judgement_or_objective_id={id}
            hide_judgement_trend={props.hide_judgement_trend}
            target_VAPs_represent={target_VAPs_represent}
            value={value}
        />)}
    </div>
}

export const WComponentJudgements = connector(_WComponentJudgements) as FunctionalComponent<OwnProps>
