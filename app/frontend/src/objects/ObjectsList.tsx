import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { ObjectListEntry } from "./ObjectListEntry"


interface OwnProps {
    object_ids?: string[]
}


const map_state = (state: RootState, props: OwnProps) => {
    let objects = [...state.objects].reverse()

    if (props.object_ids)
    {
        const include_ids = new Set(props.object_ids)
        objects = objects.filter(({ id }) => include_ids.has(id))
    }

    return { objects }
}

const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _ObjectsList (props: Props)
{
    return <table class="list">
        <tbody>
            {props.objects.map(object => <tr>
                { ObjectListEntry({object}) }
            </tr>)}
        </tbody>
    </table>
}


export const ObjectsList = connector(_ObjectsList) as FunctionComponent<OwnProps>
