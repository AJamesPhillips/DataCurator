import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import Markdown from "markdown-to-jsx"

import { WComponent, WComponentsById, wcomponent_is_plain_connection } from "../shared/models/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import { Link } from "../utils/Link"



interface OwnProps {}

const map_state = (state: RootState) =>
{
    const ready = state.sync.ready
    const wcomponents = state.specialised_objects.wcomponents
    const wcomponents_by_id = state.specialised_objects.wcomponents_by_id

    return { ready, wcomponents, wcomponents_by_id }
}



const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function _WComponentsList (props: Props)
{
    if (!props.ready) return <div>Loading...</div>

    return <div>
        {props.wcomponents.map(wc => <div style={{ width: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 6, padding: 6, border: "thin solid #aaa" }}>
            <Link
                route={undefined}
                sub_route={undefined}
                args={undefined}
                item_id={wc.id}
            >
                {(wc.title && <Markdown>{wc.title}</Markdown>) || default_text(wc, props.wcomponents_by_id)}
            </Link>
        </div>)}
    </div>
}


export const WComponentsList = connector(_WComponentsList) as FunctionComponent<OwnProps>



function default_text (wcomponent: WComponent, wcomponents_by_id: WComponentsById)
{
    if (wcomponent_is_plain_connection(wcomponent))
    {
        const from_wc = wcomponents_by_id[wcomponent.from_id]
        const from_title = from_wc ? from_wc.title : "?"
        const to_wc = wcomponents_by_id[wcomponent.to_id]
        const to_title = to_wc ? to_wc.title : "?"

        return `<Link> ${from_title} -> ${to_title}`
    }

    return "<Node>"
}
