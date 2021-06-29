import { h } from "preact"

import "./ValueAndPredictionSetSummary.scss"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"
import { Box,  ThemeProvider,  Typography } from "@material-ui/core"
import { ValueList } from "../values/ValueList"

interface OwnProps
{
    VAP_set: StateValueAndPredictionsSet
}

export function ValueAndPredictionSetSummary (props: OwnProps)
{
    const data = get_VAP_visuals_data(props.VAP_set)

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



interface VAPVisual
{
    id: string
    option_text: string
    percentage_height: number
}
function get_VAP_visuals_data (VAP_set: StateValueAndPredictionsSet): VAPVisual[]
{
    const confidence = VAP_set.shared_entry_values?.conviction || 1
    const unconfidence = 1 - confidence

    const data: VAPVisual[] = VAP_set.entries.map(VAP => ({
        id: VAP.id,
        option_text: VAP.value,
        percentage_height: VAP.probability * confidence * 100,
    }))

    data.push({
        id: "",
        option_text: "?",
        percentage_height: unconfidence * 100,
    })

    return data
}
