import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { LabelsList } from "../labels/LabelsList"
import type { ObjectWithCache, RootState } from "../state/State"


interface OwnProps {
    object: ObjectWithCache
}


function map_state (state: RootState, props: OwnProps)
{
    return {
        pattern: state.patterns.find(({ id }) => id === props.object.pattern_id)
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ObjectLabels (props: Props)
{
    const labels = [ ...props.object.labels]
    if (props.pattern?.id) labels.push(props.pattern.id)

    return <div style={{ display: "inline-block"}}>
        <LabelsList labels={labels} />
    </div>
}


export const ObjectLabels = connector(_ObjectLabels) as FunctionalComponent<OwnProps>
