import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { StatementListEntry } from "./StatementListEntry"


interface OwnProps {}


const map_state = (state: RootState) => ({
    statements: [...state.statements].reverse()
})


const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _StatementsList (props: Props)
{

    return <table class="list">
        <tbody>
            {props.statements.map(statement => <tr>
                { StatementListEntry({statement}) }
            </tr>)}
        </tbody>
    </table>
}


export const StatementsList = connector(_StatementsList) as FunctionComponent<OwnProps>
