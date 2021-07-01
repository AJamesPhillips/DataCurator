import { h } from "preact"
import { useState } from "preact/hooks"
import { Box } from "@material-ui/core"

import "./ValueAndPredictionSetSummary.scss"
import type { WComponent } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { wcomponent_VAPs_represent } from "../../shared/wcomponent/value_and_prediction/utils"
import { WComponentJudgements } from "../judgements/WComponentJudgements"
import { get_VAP_visuals_data } from "../../shared/counterfactuals/convert_VAP_sets_to_visual_VAP_sets"
import type { ComposedCounterfactualStateValueAndPredictionSetV2, TargetVAPIdCounterfactualEntry } from "../../shared/wcomponent/interfaces/counterfactual"
import { ExploreButtonHandle } from "../canvas_node/ExploreButtonHandle"
import { Link } from "../../sharedf/Link"



interface OwnProps
{
    wcomponent: WComponent
    counterfactual_VAP_set: ComposedCounterfactualStateValueAndPredictionSetV2
    flexBasis?: number
}

export function ValueAndPredictionSetSummary (props: OwnProps)
{
    const [show_all_judgements, set_show_all_judgements] = useState(false)

    const { flexBasis = 33.33333333, counterfactual_VAP_set: VAP_set } = props

    const VAPs_represent = wcomponent_VAPs_represent(props.wcomponent)
    const raw_data = get_VAP_visuals_data({ ...props, VAP_set, VAPs_represent })

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

                    const cf_entries = VAP_set.target_VAP_id_counterfactual_map[vap_visual.id] || []

                    // NOTE: I have moved the bgcolor to the Box below.
                    // This allows for color specificaton of each VAP "stripe"
                    return (

                        <Box
                            bgcolor={VAP_set.is_counterfactual ? "warning.main" : "primary.main"}
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

                                {show_judgements && <span style={{ verticalAlign: "middle" }}>
                                    <WComponentJudgements
                                        wcomponent={props.wcomponent}
                                        target_VAPs_represent={VAPs_represent}
                                        value={vap_visual.value}
                                    />
                                </span>}

                                {cf_entries.map(entry => <CounterfactualLink
                                    any_active={VAP_set.is_counterfactual}
                                    counterfactual={entry}
                                    active_counterfactual_v2_id={VAP_set.active_counterfactual_v2_id}
                                />)}

                            </Box>
                        </Box>
                    )
                })}
            </Box>
        </Box>
    )
}



interface CounterfactualLinkProps
{
    any_active: boolean
    counterfactual: TargetVAPIdCounterfactualEntry
    active_counterfactual_v2_id: string | undefined
}
function CounterfactualLink (props: CounterfactualLinkProps)
{
    const this_counterfactual_active = props.counterfactual.counterfactual_v2_id === props.active_counterfactual_v2_id

    const color = this_counterfactual_active
        ? "darkorange"
        : (props.any_active ? "white" : "#ffc965")

    const style: h.JSX.CSSProperties = {
        fontSize: "25px",
        color,
        verticalAlign: "middle",
        fontWeight: "bold",
    }

    return <span
        onPointerDown={e => e.stopImmediatePropagation()}
        onClick={e => e.stopImmediatePropagation()}
    >
        &nbsp;

        <Link
            route={undefined}
            sub_route={undefined}
            item_id={props.counterfactual.counterfactual_v2_id}
            args={undefined}
            extra_css_style={style}
        >
            &#x2442;
        </Link>

        {props.counterfactual.counterfactual_has_knowledge_view && <span style={{ fontSize: 14 }}>
            <ExploreButtonHandle
                wcomponent_id={props.counterfactual.counterfactual_v2_id || ""}
                is_highlighted={true}
            />
        </span>}

        &nbsp;
    </span>
}
