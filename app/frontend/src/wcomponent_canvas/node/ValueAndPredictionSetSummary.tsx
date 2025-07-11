import { Box } from "@mui/material"

import { get_wcomponent_VAPs_represent } from "../../wcomponent/get_wcomponent_VAPs_represent"
import type {
    ComposedCounterfactualV2StateValueAndPredictionSet,
    TargetVAPIdCounterfactualInfoMap,
} from "../../wcomponent/interfaces/counterfactual"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import {
    convert_VAP_set_to_VAP_visuals,
} from "../../wcomponent_derived/value_and_prediction/convert_VAP_set_to_VAP_visuals"
import { ValueAndPredictionEntryRow } from "./ValueAndPredictionEntryRow"
import "./ValueAndPredictionSetSummary.scss"



interface OwnProps
{
    wcomponent: WComponent
    counterfactual_VAP_set: ComposedCounterfactualV2StateValueAndPredictionSet
    VAP_id_to_counterfactuals_info_map: TargetVAPIdCounterfactualInfoMap
}

export function ValueAndPredictionSetSummary (props: OwnProps)
{
    const { counterfactual_VAP_set, VAP_id_to_counterfactuals_info_map } = props
    // todo should implement this fully?
    const wcomponents_by_id = {}
    const VAPs_represent = get_wcomponent_VAPs_represent(props.wcomponent, wcomponents_by_id)
    const VAP_visuals_data = convert_VAP_set_to_VAP_visuals({ ...props, VAP_set: counterfactual_VAP_set, VAPs_represent })
    const data_with_non_zero_certainty = VAP_visuals_data.filter(d => d.certainty > 0)

    return (
        <Box
            height="100%" maxWidth="100%" minWidth={100}
            overflow="hidden"
            position="relative"
            flexDirection="column" justifyContent="flex-end" alignItems="stretch" alignContent="stretch"
            className={`value_and_prediction_set_summary items-${VAP_visuals_data.length} visible-${data_with_non_zero_certainty.length}`}
        >
            {VAP_visuals_data.map((VAP_visual, index) =>
            {
                return <ValueAndPredictionEntryRow
                    wcomponent={props.wcomponent}
                    VAP_visual={VAP_visual}
                    counterfactual_VAP_set={counterfactual_VAP_set}
                    VAP_id_to_counterfactuals_info_map={VAP_id_to_counterfactuals_info_map}
                />
            })}
        </Box>
    )
}
