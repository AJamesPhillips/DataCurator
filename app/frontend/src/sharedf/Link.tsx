import { Component, ComponentClass, h } from "preact"
import type { Dispatch } from "redux"
import { connect, ConnectedProps } from "react-redux"

import "./Link.css"
import { routing_state_to_string } from "../state/routing/routing"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import type { ROUTE_TYPES, RoutingStateArgs, SUB_ROUTE_TYPES } from "../state/routing/interfaces"
import { merge_routing_state } from "../state/routing/merge_routing_state"
import { Box, Button } from "@material-ui/core"



interface OwnProps {
    route: ROUTE_TYPES | undefined
    sub_route: SUB_ROUTE_TYPES | undefined
    item_id: string | null | undefined
    args: Partial<RoutingStateArgs> | undefined
    on_pointer_down?: () => void
    selected_on?: Set<"route" | "args.view" | "args.subview_id">
    extra_class_name?: string
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
    link_clicked: (routing_args: Partial<RoutingStateArgs>) => dispatch(ACTIONS.routing.change_route({
        route:     own_props.route,
        sub_route: own_props.sub_route,
        item_id:   own_props.item_id,
        args:      routing_args,
    }))
})


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps

interface State { clicked: boolean }


class _Link extends Component<Props, State>
{
    constructor (props: Props)
    {
        super(props)
        this.state = { clicked: false }
    }

    private remove_clicked_class: NodeJS.Timeout | undefined
    componentWillUpdate (new_props: Props, new_state: State)
    {

        if (new_state.clicked && !this.remove_clicked_class)
        {

            this.remove_clicked_class = setTimeout(() => {

                this.setState({ clicked: false })
                this.remove_clicked_class = undefined

            }, 300)
        }
    }

    render ()
    {
        const partial_routing_args: Partial<RoutingStateArgs> = this.props.args || {}

        const on_pointer_down = (e: h.JSX.TargetedEvent<HTMLAnchorElement, MouseEvent>) => {
            if (this.props.selected) return // no-op
            this.setState({ clicked: true })

            if (this.props.on_pointer_down)
            {
                this.props.on_pointer_down()
            }
            else
            {
                this.props.link_clicked(partial_routing_args)
            }
        }

        const full_routing_state = merge_routing_state(this.props.current_routing_state, this.props)
        const full_routing_args = { ...this.props.current_routing_state.args, ...partial_routing_args }
        full_routing_state.args = full_routing_args

        const class_name = ("link "
            + (this.state.clicked ? " clicked_animate " : "")
            + (this.props.selected ? " selected " : "")
            + (this.props.extra_class_name || "")
        )


        // TODO perhaps just get rid of the anchor tag all together?  We're not using it as
        // an anchor tag at all as we're surpressing all of it's default behaviours
        return <a
            onPointerDown={on_pointer_down}
            href={routing_state_to_string({ ...full_routing_state })}
            className={class_name}
        >
            {this.props.children || "Link"}
        </a>
    }
}


export const Link = connector(_Link) as ComponentClass<OwnProps>


interface LinkButtonOwnProps extends OwnProps
{
    name: string
    style?: h.JSX.CSSProperties
}

function _LinkButton (props: Props & LinkButtonOwnProps)
{
    const partial_routing_args: Partial<RoutingStateArgs> = props.args || {}

    const on_click = (e: h.JSX.TargetedEvent<HTMLInputElement, MouseEvent>) => {
        if (props.selected) return // no-op

        if (props.on_pointer_down)
        {
            e.preventDefault()
            props.on_pointer_down()
        }
        else
        {
            props.link_clicked(partial_routing_args)
        }
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

export const LinkButton = connector(_LinkButton) as ComponentClass<OwnProps & LinkButtonOwnProps>
