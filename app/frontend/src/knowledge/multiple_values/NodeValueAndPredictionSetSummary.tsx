import { FunctionalComponent, h } from "preact"
import { Box } from "@material-ui/core"

import "./ValueAndPredictionSetSummary.scss"
import { WComponent, wcomponent_has_VAP_sets } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ValueAndPredictionSetSummary } from "./ValueAndPredictionSetSummary"
import {
    get_current_counterfactual_v2_VAP_sets,
} from "../../shared/wcomponent/value_and_prediction/get_value_v2"
import type { RootState } from "../../state/State"
import { connect, ConnectedProps } from "react-redux"
import { get_current_composed_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import type { VAP_set_id_counterfactual_mapV2 } from "../../shared/uncertainty/uncertainty"



interface OwnProps
{
    wcomponent: WComponent
    created_at_ms: number
    sim_ms: number
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { wcomponent } = own_props

    const current_composed_kv = get_current_composed_knowledge_view_from_state(state)

    let VAP_set_counterfactuals_map: VAP_set_id_counterfactual_mapV2 | undefined = undefined
    let active_counterfactual_v2_ids: string[] | undefined = undefined
    if (current_composed_kv)
    {
        active_counterfactual_v2_ids = current_composed_kv.active_counterfactual_v2_ids

        const cf = current_composed_kv.wc_id_counterfactuals_v2_map[wcomponent.id]
        VAP_set_counterfactuals_map = cf && cf.VAP_set
    }

    return {
        VAP_set_counterfactuals_map,
        active_counterfactual_v2_ids,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _NodeValueAndPredictionSetSummary (props: Props)
{
    if (!wcomponent_has_VAP_sets(props.wcomponent)) return null

    // debugger
    const VAP_set = get_current_counterfactual_v2_VAP_sets({
        ...props,
        values_and_prediction_sets: props.wcomponent.values_and_prediction_sets,
    })


    if (!VAP_set) return null

    return <Box
        flexGrow={1} flexShrink={0}
        display="flex" alignItems="stretch"
    >
        <ValueAndPredictionSetSummary
            wcomponent={props.wcomponent}
            VAP_set={VAP_set}
            flexBasis={100}
        />
    </Box>
}

export const NodeValueAndPredictionSetSummary = connector(_NodeValueAndPredictionSetSummary) as FunctionalComponent<OwnProps>
