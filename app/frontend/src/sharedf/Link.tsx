import { ComponentChildren, FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { Dispatch } from "redux"

import { Button } from "@mui/material"
import { useRef, useState } from "preact/hooks"
import { ACTIONS } from "../state/actions"
import type { ROUTE_TYPES, RoutingStateArgs, SUB_ROUTE_TYPES } from "../state/routing/interfaces"
import { merge_routing_state } from "../state/routing/merge_routing_state"
import { routing_state_to_string } from "../state/routing/routing"
import type { RootState } from "../state/State"
import "./Link.css"



interface OwnProps
{
    route: ROUTE_TYPES | undefined
    sub_route: SUB_ROUTE_TYPES | undefined
    item_id: string | null | undefined
    args: Partial<RoutingStateArgs> | undefined
    on_pointer_down?: () => boolean
    selected_on?: Set<"route" | "args.view" | "args.subview_id">
    extra_class_name?: string
    extra_css_style?: h.JSX.CSSProperties
    children?: ComponentChildren
    disabled?: boolean
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const current_routing_state = state.routing

    const { selected_on = new Set() } = own_props
    let selected = selected_on.size > 0

    if (selected_on.size)
    {
        if (selected_on.has("route") && own_props.route !== undefined) selected = selected && own_props.route === current_routing_state.route

        if (own_props.args)
        {
            if (selected_on.has("args.view") && own_props.args.view !== undefined) selected = selected && own_props.args.view === current_routing_state.args.view

            if (selected_on.has("args.subview_id") && own_props.args.subview_id !== undefined) selected = selected && own_props.args.subview_id === current_routing_state.args.subview_id
        }
    }

    return {
        current_routing_state,
        selected,
    }
}


const map_dispatch = (dispatch: Dispatch, own_props: OwnProps) => ({
    change_route: (routing_args: Partial<RoutingStateArgs>) => dispatch(ACTIONS.routing.change_route({
        route:     own_props.route,
        sub_route: own_props.sub_route,
        item_id:   own_props.item_id,
        args:      routing_args,
    }))
})


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _Link (props: Props)
{
    const { children = "Link" } = props

    const [clicked, set_clicked] = useState(false)
    const remove_clicked_class = useRef<NodeJS.Timeout | undefined>(undefined)

    if (props.disabled) return children


    if (clicked && !remove_clicked_class.current)
    {
        remove_clicked_class.current = setTimeout(() => {

            set_clicked(false)
            remove_clicked_class.current = undefined
        }, 300)
    }


    const partial_routing_args: Partial<RoutingStateArgs> = props.args || {}

    const on_pointer_down = (e: h.JSX.TargetedEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopImmediatePropagation()
        e.preventDefault()

        if (props.selected) return // no-op
        set_clicked(true)

        // If `on_pointer_down` returns true then do not change route as the handler
        // has done this already or does not want a ChangeRoute Action to fire
        if (props.on_pointer_down && props.on_pointer_down()) return

        props.change_route(partial_routing_args)
    }

    const full_routing_state = merge_routing_state(props.current_routing_state, props)
    const full_routing_args = { ...props.current_routing_state.args, ...partial_routing_args }
    full_routing_state.args = full_routing_args

    const class_name = ("link "
        + (clicked ? " clicked_animate " : "")
        + (props.selected ? " selected " : "")
        + (props.extra_class_name || "")
    )


    // TODO perhaps just get rid of the anchor tag all together?  We're not using it as
    // an anchor tag at all as we're surpressing all of its default behaviours
    return <a
        onPointerDown={on_pointer_down}
        onClick={e => { e.stopImmediatePropagation(); e.preventDefault() }}
        href={routing_state_to_string({ ...full_routing_state })}
        className={class_name}
        style={props.extra_css_style}
    >
        {children}
    </a>
}


export const Link = connector(_Link) as FunctionalComponent<OwnProps>


interface LinkButtonOwnProps extends OwnProps
{
    name: string
    style?: h.JSX.CSSProperties
}

function _LinkButton (props: Props & LinkButtonOwnProps)
{
    const partial_routing_args: Partial<RoutingStateArgs> = props.args || {}

    const on_click = (e: h.JSX.TargetedEvent<HTMLInputElement, MouseEvent>) => {
        e.stopImmediatePropagation()
        e.preventDefault()

        // If `on_pointer_down` returns true then do not change route as the handler
        // has done this already or does not want a ChangeRoute Action to fire
        if (props.on_pointer_down && props.on_pointer_down()) return
        props.change_route(partial_routing_args)
    }

    const full_routing_state = merge_routing_state(props.current_routing_state, props)
    const full_routing_args = { ...props.current_routing_state.args, ...partial_routing_args }
    full_routing_state.args = full_routing_args

    return (
        <Button
            size="small"
            color="primary"
            variant="contained"
            onClick={on_click}
            href={routing_state_to_string({ ...full_routing_state })}
        >
            {props.name || "Link"}
        </Button>
    )
}

export const LinkButton = connector(_LinkButton) as FunctionalComponent<OwnProps & LinkButtonOwnProps>
