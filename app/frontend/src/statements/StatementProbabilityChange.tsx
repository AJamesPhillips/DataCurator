import { h } from "preact"

import { date2str } from "../shared/utils/date_helpers"
import "./StatementProbabilityChange.css"



export interface ProbabililtyChange
{
    new_probability: number
    datetime: Date
    perception: string
    explanation: string
}


interface OwnProps {
    change: ProbabililtyChange
}

export function StatementProbabilityChange (props: OwnProps)
{
    const { datetime, perception, explanation } = props.change

    return <div className="statement_probability_change">
        <div>{date2str(datetime, "yyyy-MM-dd")}</div>
        <div className="perception">{perception}</div>
        <div className="explanation">{explanation}</div>
    </div>
}
