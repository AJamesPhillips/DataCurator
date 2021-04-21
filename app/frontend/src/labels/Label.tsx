import { h } from "preact"

import "./Label.css"
import type { Pattern, Statement } from "../state/State"


interface StatementProps {
    statement: Statement
}

interface PatternProps {
    pattern: Pattern
}

type Props = { is_small: boolean } & (StatementProps | PatternProps)

const is_statement_props = (props: StatementProps | PatternProps): props is StatementProps => {
    return props.hasOwnProperty("statement")
}

export function Label (props: Props)
{
    const label = is_statement_props(props) ? props.statement.content : props.pattern.name
    const css_class = "label " + (props.is_small ? "small " : " ") + (is_statement_props(props) ? "statement" : "pattern")

    return <div className={css_class}>
        {label}
    </div>
}
