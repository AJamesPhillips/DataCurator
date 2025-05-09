import { h } from "preact"

import { ALTERNATIVE_VALUE_COLOR, AltRouteIcon } from "../../sharedf/icons/AltRouteIcon"
import { Link } from "../../sharedf/Link"
import { get_wcomponent_VAPs_represent } from "../../wcomponent/get_wcomponent_VAPs_represent"
import type {
    CounterfactualV2StateValueAndPredictionSetInfo,
    TargetVAPIdCounterfactualInfoEntry,
    TargetVAPIdCounterfactualInfoMap,
} from "../../wcomponent/interfaces/counterfactual"
import type { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import type { VAPVisual } from "../../wcomponent_derived/interfaces/value"
import { ExploreButtonHandle } from "./ExploreButtonHandle"
import "./ValueAndPredictionSetSummary.scss"
import { WComponentJudgements } from "./WComponentJudgements"



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

    // Using an empty wcomponents_by_id for now as judgements on state_value should not be supported (for now)
    // and I want to think more about this use case before implementing it
    const wcomponents_by_id = {}
    const VAPs_represent = get_wcomponent_VAPs_represent(props.wcomponent, wcomponents_by_id)
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

    const warning_color = counterfactual_VAP_set.has_any_counterfactual_applied ? "warning_color" : ""

    return <div
        className={`value_and_prediction prob-${rounded_certainty_percent} ${warning_color}`}
        // p={2}
        // bgcolor={counterfactual_VAP_set.has_any_counterfactual_applied ? "warning.main" : "primary.main"}
        style={{
            fontSize: `${font_size}%`,
            maxHeight: certainty_percent_str,
            minHeight: certainty_percent_str,
        }}
    >
        {VAP_visual.value_text}
        {show_judgements && <WComponentJudgements
            wcomponent={props.wcomponent}
            target_VAPs_represent={VAPs_represent}
            value={VAP_visual.parsed_value}
            hide_judgement_trend={true}
        />}

        {cf_entries.map(entry => <CounterfactualLink
            any_active={counterfactual_VAP_set.has_any_counterfactual_applied}
            counterfactual={entry}
            active_counterfactual_v2_id={counterfactual_VAP_set.active_counterfactual_v2_id}
        />)}
    </div>
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
        ? ALTERNATIVE_VALUE_COLOR
        : (props.any_active ? "white" : "#ffc965")

    const style: h.JSX.CSSProperties = {
        fontSize: "25px",
        color, // Is this colour doing anything?
        verticalAlign: "middle",
        fontWeight: "bold",
        width: "20px",
    }

    return <span
        onPointerDown={e => e.stopImmediatePropagation()}
        onClick={e => e.stopImmediatePropagation()}
        style={{ display: "inline-flex" }}
    >
        &nbsp;

        <Link
            route={undefined}
            sub_route={undefined}
            item_id={props.counterfactual.counterfactual_v2_id}
            args={undefined}
            extra_css_style={style}
        >
            <AltRouteIcon fontSize="small" />
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
