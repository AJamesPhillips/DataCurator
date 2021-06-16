import { h } from "preact"

import { LabelsList } from "../labels/LabelsList"
import type { Statement } from "../state/State"
import { Link } from "../sharedf/Link"


interface OwnProps {
    statement: Statement
    on_click?: () => void
}


export function StatementListEntry (props: OwnProps)
{
    return [
        <td>
            <Link
                route="statements"
                sub_route={null}
                item_id={props.statement.id}
                args={undefined}
                on_pointer_down={props.on_click}
            >
                {props.statement.content}
            </Link>
        </td>,
        <td>
            <LabelsList labels={props.statement.labels}/>
        </td>,
    ]
}
