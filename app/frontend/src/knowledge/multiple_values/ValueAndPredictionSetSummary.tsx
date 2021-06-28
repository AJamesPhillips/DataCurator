import { h } from "preact"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"



interface OwnProps
{
    VAP_set: StateValueAndPredictionsSet
}

export function ValueAndPredictionSetSummary (props: OwnProps)
{
    return <div>
        {props.VAP_set.entries.map(vap =>
        {
            return <div key={vap.id}>{vap.value}</div>
        })}
    </div>
}
