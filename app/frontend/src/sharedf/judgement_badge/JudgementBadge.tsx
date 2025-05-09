import TrendingDownIcon from "@mui/icons-material/TrendingDown"
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import { QuestionMarkIcon } from "../../sharedf/icons/QuestionMarkIcon"

import type { CanvasPoint } from "../../canvas/interfaces"
import { ACTIONS } from "../../state/actions"
import { lefttop_to_xy } from "../../state/display_options/display"
import type { RoutingStateArgs } from "../../state/routing/interfaces"
import { get_store } from "../../state/store"
import type { JudgementTrend } from "../../wcomponent/interfaces/judgement"
import { Link } from "../Link"
import "./JudgementBadge.scss"
import type { JudgementValue } from "./calculate_judgement_value"



interface OwnProps
{
    judgement: JudgementValue
    judgement_trend_manual: JudgementTrend | undefined
    judgement_or_objective_id?: string
    position?: CanvasPoint
    size: "small" | "medium"
}

// Refactor this to be hidden inside JudgementBadgeConnected?
export function JudgementBadge (props: OwnProps)
{
    const { judgement, judgement_trend_manual, size } = props
    const judgement_type = judgement ? "positive" : judgement === undefined ? "inactive" : "negative"
    const class_name = `judgement_badge ${size} ${judgement_type} ${judgement_trend_manual ?? ""}`

    const trend_icon = judgement_trend_manual === "improving" ? <TrendingUpIcon />
        : judgement_trend_manual === "stable" ? <TrendingFlatIcon />
        : judgement_trend_manual === "worsening" ? <TrendingDownIcon />
        : judgement_trend_manual === "unknown" ? <QuestionMarkIcon /> : <span />


    if (!props.judgement_or_objective_id) return <div className={class_name}>{trend_icon}</div>


    let args: Partial<RoutingStateArgs> | undefined = undefined
    if (props.position) args = lefttop_to_xy({ ...props.position, zoom: 100 }, true)


    return <Link
        route={undefined}
        sub_route={undefined}
        item_id={props.judgement_or_objective_id}
        args={args}
        extra_class_name={class_name}
        on_pointer_down={() =>
        {
            const store = get_store()
            const state = store.getState()

            const { display_side_panel, display_time_sliders } = state.controls
            if (props.position) args = lefttop_to_xy(
                { ...props.position, zoom: 100 },
                true,
                { display_side_panel, display_time_sliders }
            )

            store.dispatch(ACTIONS.routing.change_route({
                item_id: props.judgement_or_objective_id,
                args,
            }))

            return true // true === We have handled changing the route
        }}
    >
        {trend_icon}
    </Link>
}
