import { FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { MenuItem as MaterialMenuItem } from "@material-ui/core"

import type { RootState } from "../state/State"
import { Link } from "../sharedf/Link"
import type { ROUTE_TYPES } from "../state/routing/interfaces"
import { CreationContextTabTitle } from "../creation_context/CreationContextTabTitle"
import { FilterContextTabTitle } from "../filter_context/FilterContextTabTitle"
import { ACTIONS } from "../state/actions"



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
    else if (id === "search") return "Search"
    else return "?" + id
}

const map_state = (state: RootState) => ({ current_route: state.routing.route })
const map_dispatch = { change_route: ACTIONS.routing.change_route }

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _AppMenuItem (props: Props)
{
    const title = get_title(props.id)
    return <MaterialMenuItem
        style={{ display: "flex", justifyContent: "flex-start", padding: "0.5em" }}
        onPointerDown={(e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) =>
        {
            e.stopImmediatePropagation()
            // TODO remove this function once the <Button /> in <Link /> takes up all the horizontal space
            props.change_route({ route: props.id, sub_route: null, item_id: null })
            props.on_pointer_down()
        }}
    >
        <Link
            route={props.id}
            sub_route={null}
            item_id={null}
            args={undefined}
            on_pointer_down={props.on_pointer_down}
        >
            {title}
        </Link>
    </MaterialMenuItem>
}

export const AppMenuItem = connector(_AppMenuItem) as FunctionComponent<OwnProps>
