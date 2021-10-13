import { h } from "preact"
import { Box } from "@material-ui/core"

import "./ValueAndPredictionSetSummary.scss"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import { get_wcomponent_VAPs_represent } from "../../wcomponent/get_wcomponent_VAPs_represent"
import { WComponentJudgements } from "./WComponentJudgements"
import type {
    CounterfactualV2StateValueAndPredictionSetInfo,
    TargetVAPIdCounterfactualInfoEntry,
    TargetVAPIdCounterfactualInfoMap,
} from "../../wcomponent/interfaces/counterfactual"
import { ExploreButtonHandle } from "./ExploreButtonHandle"
import { Link } from "../../sharedf/Link"
import type { VAPVisual } from "../../wcomponent_derived/interfaces/value"



interface OwnProps
{
    wcomponent: WComponent
    VAP_visual: VAPVisual
    show_judgements: boolean
    counterfactual_VAP_set: CounterfactualV2StateValueAndPredictionSetInfo
    VAP_id_to_counterfactuals_info_map: TargetVAPIdCounterfactualInfoMap
}

export function ValueAndPredictionEntryRow (props: OwnProps)
{
    const { VAP_visual, show_judgements, counterfactual_VAP_set, VAP_id_to_counterfactuals_info_map } = props

    const VAPs_represent = get_wcomponent_VAPs_represent(props.wcomponent)
    const certainty_percent_num = VAP_visual.certainty * 100
    const certainty_percent_str = `${certainty_percent_num}%`
    const rounded_certainty_percent = Math.round(certainty_percent_num)
    const rounded_certainty_percent_str = `${rounded_certainty_percent}%`

    let font_size = 100
    if (rounded_certainty_percent < 100)
    {
        font_size = rounded_certainty_percent * 1.25
    }
    const cf_entries = VAP_id_to_counterfactuals_info_map[VAP_visual.VAP_id] || []

    return <Box
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
                value={VAP_visual.parsed_value}
            />}

            {cf_entries.map(entry => <CounterfactualLink
                any_active={counterfactual_VAP_set.has_any_counterfactual_applied}
                counterfactual={entry}
                active_counterfactual_v2_id={counterfactual_VAP_set.active_counterfactual_v2_id}
            />)}

        </Box>
    </Box>
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
