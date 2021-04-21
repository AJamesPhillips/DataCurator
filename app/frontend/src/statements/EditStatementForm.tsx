import { FunctionalComponent, h } from "preact"
import type { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"

import { LabelsList } from "../labels/LabelsList"
import { DeleteButton } from "../sharedf/DeleteButton"
import type { Statement } from "../state/State"
import { ACTIONS } from "../state/actions"


interface OwnProps {
    statement: Statement
}


const map_dispatch = (dispatch: Dispatch, props: OwnProps) => ({
    delete_statement: () => {
        dispatch(ACTIONS.statement.delete_statement(props.statement.id))
        dispatch(ACTIONS.routing.change_route({ route: "statements", sub_route: undefined, item_id: undefined, args: {} }))
    },
})


const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _EditStatementForm (props: Props)
{
    const labels = props.statement.labels

    return <div>
        <input
            type="text"
            placeholder="Statement"
            value={props.statement.content}
            // onChange={content_changed}
            disabled={true}
        ></input>

        <br/>
        <br/>

        Labels:
        <LabelsList labels={labels} />

        <hr />

        <DeleteButton on_delete={() => props.delete_statement()} is_large={true}/>

    </div>
}


export const EditStatementForm = connector(_EditStatementForm) as FunctionalComponent<OwnProps>
