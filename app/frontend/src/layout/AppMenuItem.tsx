import { MenuItem as MaterialMenuItem } from "@mui/material"
import { ComponentChildren, FunctionComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { CreationContextTabTitle } from "../creation_context/CreationContextTabTitle"
import { FilterContextTabTitle } from "../filter_context/FilterContextTabTitle"
import { Link } from "../sharedf/Link"
import { ACTIONS } from "../state/actions"
import type { ROUTE_TYPES } from "../state/routing/interfaces"
import type { RootState } from "../state/State"
import { route_to_text } from "./route_to_text"



interface OwnProps
{
    id: ROUTE_TYPES
    on_pointer_down: () => void
}

function get_title (id: ROUTE_TYPES)
{

    if (id === "filter") return <FilterContextTabTitle />
    else if (id === "creation_context") return <CreationContextTabTitle />
    else return route_to_text(id)
}


const map_state = (state: RootState) => ({ current_route: state.routing.route })
const map_dispatch = { change_route: ACTIONS.routing.change_route }

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

function _AppMenuItem (props: Props)
{
    const handle_pointer_down_on_menu_item = () =>
    {
        props.on_pointer_down()
        props.change_route({ route: props.id, sub_route: null, item_id: null })
    }


    const handle_pointer_down_on_link = () =>
    {
        props.on_pointer_down()
        return false // false === We have not handled this click changing the route, tell
        // Link this still needs to happen
    }


    const title = get_title(props.id)
    return <CustomisableAppMenuItem
        // TODO remove this call of `change_route` once the <Button /> in <Link /> takes
        // up all the horizontal space
        on_pointer_down={handle_pointer_down_on_menu_item}
    >
        <Link
            route={props.id}
            sub_route={null}
            item_id={null}
            args={undefined}
            on_pointer_down={handle_pointer_down_on_link}
        >
            {title}
        </Link>
    </CustomisableAppMenuItem>
}

export const AppMenuItem = connector(_AppMenuItem) as FunctionComponent<OwnProps>



export function CustomisableAppMenuItem (props: { on_pointer_down: () => void } & { children: ComponentChildren })
{
    return <MaterialMenuItem
        style={{ display: "flex", justifyContent: "flex-start", padding: "0.5em" }}
        onPointerDown={(e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) =>
        {
            e.stopImmediatePropagation()
            props.on_pointer_down()
        }}
    >
        {props.children}
    </MaterialMenuItem>
}
