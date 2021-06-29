import { h } from "preact"

import "./ValueAndPredictionSetSummary.scss"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"
import { Box } from "@material-ui/core"
import { clean_VAP_set_entries, parse_VAP_value } from "../../shared/wcomponent/value_and_prediction/get_value"
import { VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import { get_boolean_representation, VAP_value_to_string } from "../../shared/wcomponent/get_wcomponent_state_UI_value"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { wcomponent_VAPs_represent } from "../../shared/wcomponent/value_and_prediction/utils"



interface OwnProps
{
    wcomponent: WComponent
    VAP_set: StateValueAndPredictionsSet
}

export function ValueAndPredictionSetSummary (props: OwnProps)
{
    const VAPs_represent = wcomponent_VAPs_represent(props.wcomponent)
    const data = get_VAP_visuals_data({ ...props, VAPs_represent })

    return (
        // Try out various bgcolor values!
        // valid values are based on what is in:
        // frontend/src/ui_themes/material_default.tsx
        // valid values include: success.main, info.main, warning.main, error.main
        <Box
            bgcolor="primary.main"
            border={3} borderColor="white"
            flexGrow={0} flexShrink={0} flexBasis="33.33333333%"
            display="flex" flexDirection="column"
            alignItems="stretch" alignContent="stretch"
            justifyContent="flex-end"
            className="value_and_prediction_set_summary">
                {data.map(vap_visual =>
                {
                    return (
                        <Box
                            flexGrow={0} flexShrink={1}
                            flexBasis={`${vap_visual.percentage_height}%`}
                            maxHeight={`${vap_visual.percentage_height}%`}
                            display="flex" flexDirection="column"
                            alignItems="center" justifyContent="center"
                            key={vap_visual.id}
                            className="value_and_prediction"
                        >
                            <Box p={1} height="1.5em" overflow="hidden" textOverflow="ellipsis">
                                {vap_visual.option_text}
                            </Box>
                        </Box>
                    )
                })}
        </Box>
    )
}



interface GetVAPVisualsDataArgs
{
    VAP_set: StateValueAndPredictionsSet
    VAPs_represent: VAPsType
    wcomponent: WComponent
}
interface VAPVisual
{
    id: string
    option_text: string
    percentage_height: number
}
function get_VAP_visuals_data (args: GetVAPVisualsDataArgs): VAPVisual[]
{
    const boolean_representation = get_boolean_representation({ wcomponent: args.wcomponent })

    const cleaned_VAP_set = clean_VAP_set_entries(args.VAP_set, args.VAPs_represent)
    const expanded_VAP_set = expand_booleans(cleaned_VAP_set, args.VAPs_represent)

    const confidence = expanded_VAP_set.shared_entry_values?.conviction || 1
    const unconfidence = 1 - confidence


    const data: VAPVisual[] = expanded_VAP_set.entries.map(VAP =>
    {
        const value = parse_VAP_value(VAP, args.VAPs_represent)
        const option_text = VAP_value_to_string(value, boolean_representation)

        return {
            id: VAP.id,
            option_text,
            percentage_height: VAP.probability * confidence * 100,
        }
    })


    data.push({
        id: "id__undefined__",
        option_text: "?",
        percentage_height: unconfidence * 100,
    })

    return data
}



function expand_booleans (VAP_set: StateValueAndPredictionsSet, VAPs_represent: VAPsType)
{
    if (VAPs_represent === VAPsType.boolean)
    {
        const VAP_true = VAP_set.entries[0]
        if (!VAP_true) return VAP_set

        const VAP_false = {
            ...VAP_true,
            probability: 1 - VAP_true.probability,
            id: "id__false__",
            description: "",
        }

        const entries = [...VAP_set.entries, VAP_false ]
        VAP_set = { ...VAP_set, entries }
    }

    return VAP_set
}
