import { h } from "preact"
import { useState } from "preact/hooks"
import { Box } from "@material-ui/core"

import "./ValueAndPredictionSetSummary.scss"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_VAPs_represent } from "../../wcomponent/value_and_prediction/utils"
import { WComponentJudgements } from "../../knowledge/judgements/WComponentJudgements"
import { get_VAP_visuals_data } from "../../wcomponent/value_and_prediction/convert_VAP_sets_to_visual_VAP_sets"
import type {
    ComposedCounterfactualStateValueAndPredictionSetV2,
    TargetVAPIdCounterfactualInfoEntry,
    TargetVAPIdCounterfactualInfoMap,
} from "../../wcomponent/interfaces/counterfactual"
import { ExploreButtonHandle } from "./ExploreButtonHandle"
import { Link } from "../../sharedf/Link"


interface OwnProps
{
    wcomponent: WComponent
    counterfactual_VAP_set: ComposedCounterfactualStateValueAndPredictionSetV2
    VAP_id_to_counterfactuals_info_map: TargetVAPIdCounterfactualInfoMap
}

export function ValueAndPredictionSetSummary (props: OwnProps)
{
    const [show_all_judgements, set_show_all_judgements] = useState(false)
    const { counterfactual_VAP_set, VAP_id_to_counterfactuals_info_map } = props
    const VAPs_represent = get_wcomponent_VAPs_represent(props.wcomponent)
    const VAP_visuals_data = get_VAP_visuals_data({ ...props, VAP_set: counterfactual_VAP_set, VAPs_represent })
    const data_with_non_zero_certainty = VAP_visuals_data.filter(d => d.certainty > 0)

    return (
        <Box
            height="100%" maxWidth="100%" minWidth={100}
            overflow="hidden"
            position="relative"
            flexDirection="column" justifyContent="flex-end" alignItems="stretch" alignContent="stretch"
            className={`value_and_prediction_set_summary items-${VAP_visuals_data.length} visible-${data_with_non_zero_certainty.length}`}
            onPointerOver={() => set_show_all_judgements(true)}
            onPointerLeave={() => set_show_all_judgements(false)}
        >
            {VAP_visuals_data.map((VAP_visual, index) =>
            {
                const certainty_percent_num = VAP_visual.certainty * 100
                const certainty_percent_str = `${certainty_percent_num}%`
                const rounded_certainty_percent = Math.round(certainty_percent_num)
                const rounded_certainty_percent_str = `${rounded_certainty_percent}%`

                let font_size = 100
                if (rounded_certainty_percent < 100) {
                    font_size = rounded_certainty_percent * 1.25
                }
                const show_judgements = show_all_judgements || index === 0
                const cf_entries = VAP_id_to_counterfactuals_info_map[VAP_visual.VAP_id] || []
                return (
                    <Box
                        className={`value_and_prediction prob-${rounded_certainty_percent}`}
                        p={2} boxSizing="border-box"
                        position="relative"
                        bgcolor={counterfactual_VAP_set.has_any_counterfactual_applied ? "warning.main" : "primary.main"}
                        flexGrow={1} flexShrink={1} flexBasis="auto"
                        display="flex" flexDirection="row" justifyContent="center" alignItems="center"
                        fontSize={`${font_size}%`}
                        lineHeight="1em"
                        maxHeight={certainty_percent_str}
                        minHeight={certainty_percent_str}
                        maxWidth="100%"
                    >
                        <Box
                            fontSize="inherit"
                            maxWidth="100%" overflow="hidden"
                            whiteSpace="nowrap"
                            overflowX="hidden" overflowY="visible"
                            textOverflow="ellipsis"
                            position="relative"
                            zIndex={10}
                        >
                            {VAP_visual.value_text}
                            {show_judgements && <WComponentJudgements
                                wcomponent={props.wcomponent}
                                target_VAPs_represent={VAPs_represent}
                                value={VAP_visual.value}
                            />}

                            {cf_entries.map(entry => <CounterfactualLink
                                any_active={counterfactual_VAP_set.has_any_counterfactual_applied}
                                counterfactual={entry}
                                active_counterfactual_v2_id={counterfactual_VAP_set.active_counterfactual_v2_id}
                            />)}

                        </Box>
                    </Box>
                )
            })}
        </Box>
    )
}



interface CounterfactualLinkProps
{
    any_active: boolean
    counterfactual: TargetVAPIdCounterfactualInfoEntry
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
