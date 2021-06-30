import { h } from "preact"
import { useState } from "preact/hooks"
import { Box } from "@material-ui/core"

import "./ValueAndPredictionSetSummary.scss"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { wcomponent_VAPs_represent } from "../../shared/wcomponent/value_and_prediction/utils"
import { WComponentJudgements } from "../judgements/WComponentJudgements"
import { get_VAP_visuals_data } from "../../shared/counterfactuals/convert_VAP_sets_to_visual_VAP_sets"



interface OwnProps
{
    wcomponent: WComponent
    VAP_set: StateValueAndPredictionsSet
    flexBasis?: number
}

export function ValueAndPredictionSetSummary (props: OwnProps)
{
    const [show_all_judgements, set_show_all_judgements] = useState(false)

    const { flexBasis = 33.33333333 } = props

    const VAPs_represent = wcomponent_VAPs_represent(props.wcomponent)
    const raw_data = get_VAP_visuals_data({ ...props, VAPs_represent })

    // For now put the most likely at the top so that most of the time things are a bit brighter
    const put_most_probable_last = false
    const data = put_most_probable_last ? raw_data.reverse() : raw_data

    return (
        <Box
            // This box is really just serving to allow for padding without
            // without overflowing the parent container
            p={1}
            display="flex" flexDirection="column"
            alignItems="stretch" alignContent="stretch" justifyContent="center"
            flexGrow={0} flexShrink={0} flexBasis={`${flexBasis}%`}
        >
            <Box
                flexGrow={1} flexShrink={1}
                display="flex" flexDirection="column"
                alignItems="stretch" alignContent="stretch"
                justifyContent="flex-end"
                className="value_and_prediction_set_summary"
                onPointerOver={() => set_show_all_judgements(true)}
                onPointerLeave={() => set_show_all_judgements(false)}
            >
                {data.map((vap_visual, index) =>
                {
                    const show_judgements = show_all_judgements || index === (put_most_probable_last ? data.length - 1 : 0)
                    const base_line_height = `${vap_visual.certainty * 200}%`

                    // NOTE: I have moved the bgcolor to the Box below.
                    // This allows for color specificaton of each VAP "stripe"
                    return (

                        <Box
                            bgcolor="primary.main"
                            position="relative" overflow="hidden"
                            flexGrow={0} flexShrink={0}
                            flexBasis={`${vap_visual.certainty * 100}%`}
                            lineHeight={base_line_height}
                            minHeight={`${vap_visual.certainty * 100}%`}
                            display="flex" flexDirection="column"
                            alignItems="center" justifyContent="center"
                            key={vap_visual.id}
                            className="value_and_prediction"
                            onClick={() => {}}
                        >
                            <Box
                                position="relative" zIndex="10"
                                overflowY="hidden" textOverflow="ellipsis"
                            >
                                    {vap_visual.value_text}

                                    {show_judgements && <WComponentJudgements
                                        wcomponent={props.wcomponent}
                                        target_VAPs_represent={VAPs_represent}
                                        value={vap_visual.value}
                                    />}
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}
