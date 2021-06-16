import { h } from "preact"

import "./JudgementBadge.css"
import type { JudgementValue } from "./calculate_judgement_value"
import { format_wcomponent_url } from "../../shared/wcomponent/rich_text/templates"
import type { CanvasPoint } from "../../canvas/interfaces"



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

    const href = format_wcomponent_url("", props.judgement_or_objective_id, props.position)

    return <a
        className={class_name}
        href={href}
        disabled={!href}
        onPointerDown={e =>
        {
            e.preventDefault()
            e.stopImmediatePropagation()
        }}
    ></a>
}
