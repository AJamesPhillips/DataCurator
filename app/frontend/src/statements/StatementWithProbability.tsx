import { h } from "preact"

import { StatementProbability } from "./StatementProbability"
import "./StatementWithProbability.css"



interface OwnProps
{
    statement: string
    probability: number
}


export function StatementWithProbabililty (props: OwnProps)
{
    return <div className="statement_with_probability">
        <div className="statement">{props.statement}</div>
        <StatementProbability probability={props.probability} />
    </div>
}



export function DemoStatementProbability ()
{
    const props = {
        statement: "Some statement",
        probability: 4,
    }

    return <StatementWithProbabililty {...props} />
}
