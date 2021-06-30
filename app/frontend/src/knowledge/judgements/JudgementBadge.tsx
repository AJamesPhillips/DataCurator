import { h } from "preact"

import "./JudgementBadge.css"
import type { JudgementValue } from "./calculate_judgement_value"
import type { CanvasPoint } from "../../canvas/interfaces"
import { Link } from "../../sharedf/Link"
import type { RoutingStateArgs } from "../../state/routing/interfaces"
import { lefttop_to_xy } from "../../state/display_options/display"



interface OwnProps
{
    judgement: JudgementValue
    judgement_or_objective_id?: string
    position?: CanvasPoint
}

// Refactor this to be hidden inside JudgementBadgeC
export function JudgementBadge (props: OwnProps)
{
    const judgement_type = props.judgement ? "positive" : props.judgement === undefined ? "inactive" : "negative"
    const class_name = `judgement_badge ${judgement_type}`

    if (!props.judgement_or_objective_id) return <div className={class_name}></div>


    let args: Partial<RoutingStateArgs> | undefined = undefined
    // Commmenting out for the moment as judgements are hidden from the canvas
    // if (props.position) args = lefttop_to_xy({ ...props.position, zoom: 100 }, true)


    return <Link
        route={undefined}
        sub_route={undefined}
        item_id={props.judgement_or_objective_id}
        args={args}
        extra_class_name={class_name}
    ><span/></Link>
}
