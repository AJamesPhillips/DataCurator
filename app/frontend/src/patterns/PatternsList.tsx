import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { PatternListEntry } from "./PatternListEntry"


interface OwnProps {}


const map_state = (state: RootState) => ({
    patterns: [...state.patterns].reverse()
})


const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _PatternsList (props: Props)
{

    return <table class="list">
        <tbody>
            {props.patterns.map(pattern => <tr>
                { PatternListEntry({pattern}) }
            </tr>)}
        </tbody>
    </table>
}


export const PatternsList = connector(_PatternsList) as FunctionComponent<OwnProps>
