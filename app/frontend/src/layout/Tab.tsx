import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"
import { Link } from "../sharedf/Link"
import type { ROUTE_TYPES } from "../state/routing/interfaces"
import { CreationContextTabTitle } from "../creation_context/CreationContextTabTitle"
import { FilterContextTabTitle } from "../filter_context/FilterContextTabTitle"


interface OwnProps
{
    id: ROUTE_TYPES
    on_pointer_down: () => void
}

function get_title (id: ROUTE_TYPES)
{
    if (id === "filter") return <FilterContextTabTitle />
    else if (id === "display") return "Display options"
    else if (id === "statements") return "Statements"
    else if (id === "objects") return "Objects"
    else if (id === "patterns") return "Patterns"
    else if (id === "creation_context") return <CreationContextTabTitle />
    else if (id === "views") return "Views"
    else if (id === "perceptions") return "Perceptions"
    else if (id === "wcomponents") return "Components"
    else if (id === "about") return "About"
    else return "?" + id
}

const map_state = (state: RootState) => ({ current_route: state.routing.route })
const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>
type Props = PropsFromRedux & OwnProps

function _Tab (props: Props)
{
    const title = get_title(props.id)
    return (
        <Link
            route={props.id}
            sub_route={null}
            item_id={null}
            args={undefined}
            on_pointer_down={props.on_pointer_down}
        >
            {title}
        </Link>
    )
}

export const Tab = connector(_Tab) as FunctionComponent<OwnProps>
