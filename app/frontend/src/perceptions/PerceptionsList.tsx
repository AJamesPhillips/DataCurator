import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { Link } from "../sharedf/Link"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const { ready } = state.sync
    const perceptions = state.derived.perceptions

    return { ready, perceptions }
}



const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _PerceptionsList (props: Props)
{
    if (!props.ready) return <div>Loading...</div>

    return <div>
        {props.perceptions.map(pe => <div style={{ width: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 6, padding: 6, border: "thin solid #aaa" }}>
            <Link
                route="perceptions"
                sub_route={undefined}
                args={undefined}
                item_id={pe.id}
            >
                {pe.title}
            </Link>
        </div>)}
    </div>
}


export const PerceptionsList = connector(_PerceptionsList) as FunctionComponent<OwnProps>
