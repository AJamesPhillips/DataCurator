import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { Label } from "./Label"


interface OwnProps
{
    labels: string[]  // statement_id[]
}


function map_state (state: RootState, { labels }: OwnProps)
{
    const item_ids = new Set(labels)

    return {
        label_patterns: state.patterns.filter(({ id }) => item_ids.has(id)),
        label_statements: state.statements.filter(({ id }) => item_ids.has(id)),
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _LabelsList (props: Props)
{
    return <div>
        {props.label_patterns.map(p => <Label pattern={p} is_small={true} />)}
        {props.label_statements.map(s => <Label statement={s} is_small={true} />)}
    </div>
}


export const LabelsList = connector(_LabelsList) as FunctionalComponent<OwnProps>
