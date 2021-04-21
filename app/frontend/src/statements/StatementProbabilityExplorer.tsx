import { h } from "preact"

import { ProbabililtyChange, StatementProbabilityChange } from "./StatementProbabilityChange"
import "./StatementProbabilityExplorer.css"
import { StatementProbability } from "./StatementProbability"


interface OwnProps
{
    statement: string
    probability: number
    changes: ProbabililtyChange[]
}


export function StatementProbabilityExplorer (props: OwnProps)
{
    const { statement, probability, changes } = props

    return <div className="statement_probability_explorer">
        <div className="statement">
            {statement}
        </div>
        {changes.map(change => [
            <br />,
            <br />,
            <StatementProbability probability={change.new_probability} />,
            <br />,
            <br />,
            <StatementProbabilityChange change={change}/>,
        ])}
    </div>
}


export function DemoStatementProbabilityExplorer ()
{
    const changes: ProbabililtyChange[] = [
        {
            new_probability: 90,
            datetime: new Date("2021-01-10 12:00"),
            perception: "Event: Recording actions and project prioties was very illuminating",
            explanation: "This meta work has paid dividends already and I have a gut feel there's a lot more value in recording and later reviewing our knowledge, decisions and how the two related to each other."
        },
        {
            new_probability: 50,
            datetime: new Date("2020-12-10"),
            perception: "Process: we are not doing much to track or try and parse complexity",
            explanation: "Suggests that meta work might help."
        }
    ]

    return <StatementProbabilityExplorer
        statement="Meta work will help us be more productive in the medium and long term"
        probability={90}
        changes={changes}
    />
}
