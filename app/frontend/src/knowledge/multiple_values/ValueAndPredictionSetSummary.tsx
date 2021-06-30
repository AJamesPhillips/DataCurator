import { h } from "preact"

import "./ValueAndPredictionSetSummary.scss"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"
import { Box } from "@material-ui/core"
import { clean_VAP_set_entries, parse_VAP_value } from "../../shared/wcomponent/value_and_prediction/get_value"
import { ParsedValue, VAPsType } from "../../shared/wcomponent/interfaces/generic_value"
import { get_boolean_representation, VAP_value_to_string } from "../../shared/wcomponent/get_wcomponent_state_UI_value"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { wcomponent_VAPs_represent } from "../../shared/wcomponent/value_and_prediction/utils"
import { sort_list } from "../../shared/utils/sort"
import { WComponentJudgements } from "../judgements/WComponentJudgements"
import { useState } from "preact/hooks"



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
            m={1}
            // border={1} borderColor="primary.main"
            flexGrow={0} flexShrink={0} flexBasis={`${flexBasis}%`}
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

                // NOTE: I have moved the bgcolor to the Box below.
                // This allows for color specificaton of each VAP "stripe"
                return (

                    <Box
                        bgcolor="primary.main"
                        position="relative" overflow="hidden"
                        flexGrow={0} flexShrink={1}
                        flexBasis={`${vap_visual.percentage_height}%`}
                        display="flex" flexDirection="column"
                        alignItems="center" justifyContent="center"
                        key={vap_visual.id}
                        className="value_and_prediction"
                        onClick={() => {}}
                    >
                        <Box
                            position="relative" zIndex="10"
                            component="span"
                            height="1.5em" lineHeight="1.5em"
                            textOverflow="ellipsis">
                                {vap_visual.option_text}

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
    value: ParsedValue
}
function get_VAP_visuals_data (args: GetVAPVisualsDataArgs): VAPVisual[]
{
    const boolean_representation = get_boolean_representation({ wcomponent: args.wcomponent })

    const cleaned_VAP_set = clean_VAP_set_entries(args.VAP_set, args.VAPs_represent)
    const expanded_VAP_set = expand_booleans(cleaned_VAP_set, args.VAPs_represent)

    const maybe_confidence = expanded_VAP_set.shared_entry_values?.conviction
    const confidence = maybe_confidence === undefined ? 1 : maybe_confidence
    let total_certainties = 0


    const data: VAPVisual[] = expanded_VAP_set.entries.map((VAP, index) =>
    {
        let value = parse_VAP_value(VAP, args.VAPs_represent)
        if (args.VAPs_represent === VAPsType.boolean)
        {
            value = index === 0
        }
        const option_text = VAP_value_to_string(value, boolean_representation)
        const certainty = VAP.probability * confidence
        total_certainties += certainty

        return {
            id: VAP.id,
            option_text,
            percentage_height: certainty * 100,
            value,
        }
    })

    // TODO protect against unstable sort when percentage_height is the same
    const sorted_data = sort_list(data, i => i.percentage_height, "descending")

    // Always put uncertain value last
    sorted_data.push({
        id: "id__undefined__",
        option_text: "?",
        percentage_height: (1 - total_certainties) * 100,
        value: null, // should result in `undefined` as a judgemnet
    })

    return sorted_data
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
