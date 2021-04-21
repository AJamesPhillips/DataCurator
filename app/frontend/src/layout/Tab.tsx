import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState, ROUTE_TYPES } from "../state/State"
import "./Tab.css"
import { Link } from "../utils/Link"


interface OwnProps {
    id: ROUTE_TYPES
}


function get_title (id: ROUTE_TYPES)
{
    if (id === "filter") return "Filter"
    else if (id === "statements") return "Statements"
    else if (id === "objects") return "Objects"
    else if (id === "patterns") return "Patterns"
    else if (id === "creation_context") return "Creation Context"
    else if (id === "views") return "Views"
    else if (id === "perceptions") return "Perceptions"
    else if (id === "wcomponents") return "Components"

    else return "?" + id
}


const map_state = (state: RootState) => ({
    current_route: state.routing.route
})

const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>


type Props = PropsFromRedux & OwnProps


function _Tab (props: Props)
{
    const title = get_title(props.id)
    const css_class = "tab " + (props.current_route === props.id ? "selected" : "")

    return <div
        class={css_class}
    >
        <Link route={props.id} sub_route={null} item_id={null} args={undefined} >
            {title}
        </Link>
    </div>
}


export const Tab = connector(_Tab) as FunctionComponent<OwnProps>
