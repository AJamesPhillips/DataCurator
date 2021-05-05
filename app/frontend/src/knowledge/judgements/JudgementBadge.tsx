import { h } from "preact"

import "./JudgementBadge.css"
import type { JudgementValue } from "./calculate_judgement_value"



interface OwnProps
{
    judgement: JudgementValue
}

// Refactor this to be hidden inside JudgementBadgeC
export function JudgementBadge (props: OwnProps)
{
    const class_name = `judgement_badge ${props.judgement ? "positive" : props.judgement === undefined ? "inactive" : "negative"}`

    return <div className={class_name}></div>
}
