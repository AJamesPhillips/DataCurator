import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { EditStatementForm } from "../statements/EditStatementForm"
import { StatementsList } from "../statements/StatementsList"
import { NewStatementForm } from "../statements/NewStatementForm"


interface OwnProps {}


const map_state = (state: RootState) => ({
    statement: state.statements.find(({ id }) => id === state.routing.item_id),
    statement_count: state.statements.length,
})

const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _Statements (props: Props)
{
    if (props.statement)
    {
        return <div>
            <EditStatementForm statement={props.statement} />
        </div>
    }

    return <div>
        <b>Add statements</b>
        <hr />
        <NewStatementForm />
        <hr />
        Statements: {props.statement_count}
        <StatementsList />
    </div>
}


export const Statements = connector(_Statements) as FunctionComponent<OwnProps>
