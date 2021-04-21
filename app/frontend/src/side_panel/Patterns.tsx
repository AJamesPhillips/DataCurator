import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { EditPatternForm } from "../patterns/EditPatternForm"
import { PatternsList } from "../patterns/PatternsList"
import { NewPatternForm } from "../patterns/NewPatternForm"


interface OwnProps {}


const map_state = (state: RootState) => ({
    pattern: state.patterns.find(({ id }) => id === state.routing.item_id),
    pattern_count: state.patterns.length,
})

const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _Patterns (props: Props)
{
    if (props.pattern)
    {
        return <div>
            <EditPatternForm pattern={props.pattern} />
        </div>
    }

    return <div>
        <b>Add patterns</b>
        <hr />
        <NewPatternForm />
        <hr />
        Patterns: {props.pattern_count}
        <PatternsList />
    </div>
}


export const Patterns = connector(_Patterns) as FunctionComponent<OwnProps>
