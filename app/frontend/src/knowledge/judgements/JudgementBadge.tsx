import { h } from "preact"

import "./JudgementBadge.css"
import type { JudgementValue } from "./calculate_judgement_value"
import { format_wcomponent_url } from "../../shared/models/rich_text/templates"



interface OwnProps
{
    judgement: JudgementValue
    judgement_id?: string
}

// Refactor this to be hidden inside JudgementBadgeC
export function JudgementBadge (props: OwnProps)
{
    const judgement_type = props.judgement ? "positive" : props.judgement === undefined ? "inactive" : "negative"
    const class_name = `judgement_badge ${judgement_type}`

    if (!props.judgement_id) return <div className={class_name}></div>

    const href = format_wcomponent_url("", props.judgement_id)

    return <a className={class_name} href={href} disabled={!href}></a>
}
