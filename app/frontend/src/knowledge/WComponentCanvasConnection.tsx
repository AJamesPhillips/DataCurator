import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { CanvasConnnection } from "../canvas/connections/CanvasConnnection"
import { get_wcomponent_validity_value } from "../shared/wcomponent/get_wcomponent_validity_value"
import type { WComponentJudgement } from "../shared/wcomponent/interfaces/judgement"
import type {
    KnowledgeViewWComponentIdEntryMap,
    KnowledgeViewWComponentEntry,
} from "../shared/wcomponent/interfaces/knowledge_view"
import {
    WComponent,
    wcomponent_is_plain_connection,
    wcomponent_can_render_connection,
    WComponentConnection,
    ConnectionTerminalType,
} from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../state/actions"
import type { ValidityFilterOption, ValidityFilterTypes } from "../state/display_options/state"
import { get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import {
    calc_display_opacity,
    get_wcomponent_is_invalid_for_display,
    wcomponent_is_not_yet_created,
} from "./utils"



interface OwnProps
{
    id: string
}


const map_state = (state: RootState, props: OwnProps) =>
{
    const wcomponent = get_wcomponent_from_state(state, props.id)

    const { current_UI_knowledge_view } = state.derived
    const { created_at_ms, sim_ms } = state.routing.args
    const { derived_validity_filter: validity_filter } = state.display_options

    let certainty = 1
    let from_wc: WComponent | undefined = undefined
    let to_wc: WComponent | undefined = undefined


    if (wcomponent && wcomponent_is_plain_connection(wcomponent))
    {
        from_wc = get_wcomponent_from_state(state, wcomponent.from_id)
        to_wc = get_wcomponent_from_state(state, wcomponent.to_id)

        certainty = calc_connection_certainty({
            wcomponent, validity_filter, from_wc, to_wc, created_at_ms, sim_ms,
        })
    }

    return {
        current_UI_knowledge_view,
        wcomponent,
        certainty,
        is_current_item: state.routing.item_id === props.id,
        validity_formatting: state.display_options.derived_validity_formatting,
    }
}



interface CalculateConnectionCertaintyArgs
{
    wcomponent: WComponentConnection
    validity_filter: ValidityFilterOption
    from_wc: WComponent | undefined
    to_wc: WComponent | undefined
    created_at_ms: number
    sim_ms: number
}
function calc_connection_certainty (args: CalculateConnectionCertaintyArgs)
{
    const { wcomponent, validity_filter, from_wc, to_wc, created_at_ms, sim_ms } = args

    if (!from_wc || !to_wc) return 0


    const not_yet_created = wcomponent_is_not_yet_created(wcomponent, created_at_ms)
    if (not_yet_created) return 0


    const validity_value = get_wcomponent_validity_value({ wcomponent, created_at_ms, sim_ms })
    const invalid_for_display = get_wcomponent_is_invalid_for_display({ validity_value, validity_filter })
    if (invalid_for_display) return 0


    const target_or_source_not_yet_created = (
        wcomponent_is_not_yet_created(from_wc, created_at_ms)
        || wcomponent_is_not_yet_created(to_wc, created_at_ms)
    )
    if (target_or_source_not_yet_created) return 0


    const from_validity_value = get_wcomponent_validity_value({ wcomponent: from_wc, created_at_ms, sim_ms })
    const to_validity_value = get_wcomponent_validity_value({ wcomponent: to_wc, created_at_ms, sim_ms })

    const target_or_source_invalid = (
        get_wcomponent_is_invalid_for_display({ validity_value: from_validity_value, validity_filter })
        || get_wcomponent_is_invalid_for_display({ validity_value: to_validity_value, validity_filter })
    )
    if (target_or_source_invalid) return 0


    const connection_certainty = Math.min(from_validity_value.certainty, to_validity_value.certainty)

    return connection_certainty
}



const map_dispatch = {
    clicked_wcomponent: ACTIONS.specialised_object.clicked_wcomponent,
    clear_selected_wcomponents: ACTIONS.specialised_object.clear_selected_wcomponents,
    change_route: ACTIONS.routing.change_route,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCanvasConnection (props: Props)
{
    const {
        id, current_UI_knowledge_view, wcomponent, is_current_item, certainty,
        change_route,
    } = props

    if (!wcomponent)
    {
        console.error(`Tried to render a WComponentCanvasConnection of world component id: "${id}" but could not find it`)
        return null
    }

    if (!wcomponent_can_render_connection(wcomponent))
    {
        console.error(`Tried to render a WComponentCanvasConnection of world component id: "${id}" but was not a causal link`)
        return null
    }

    if (certainty === 0) return null

    if (!current_UI_knowledge_view)
    {
        console.error(`Tried to render a WComponentCanvasConnection of world component id: "${id}" but no current_UI_knowledge_view`)
        return null
    }


    const on_pointer_down = (e: h.JSX.TargetedMouseEvent<SVGGElement>) =>
    {
        e.stopImmediatePropagation()
        e.preventDefault()

        props.clicked_wcomponent({ id })

        // Copied from Node
        if (is_current_item)
        {
            change_route({ route: "wcomponents", sub_route: null, item_id: null })
            props.clear_selected_wcomponents({})
        }
        else change_route({ route: "wcomponents", sub_route: null, item_id: id })
    }


    const { from_node_position, to_node_position, from_connection_type, to_connection_type,
    } = get_connection_terminal_positions({ wcomponent, wc_id_map: current_UI_knowledge_view.derived_wc_id_map })


    const validity_opacity = calc_display_opacity({
        certainty,
        is_current_item,
        validity_formatting: props.validity_formatting,
    })


    return <CanvasConnnection
        from_node_position={from_node_position}
        to_node_position={to_node_position}
        from_connection_type={from_connection_type}
        to_connection_type={to_connection_type}
        on_pointer_down={on_pointer_down}
        intensity={validity_opacity}
        is_highlighted={is_current_item}
    />
}

export const WComponentCanvasConnection = connector(_WComponentCanvasConnection) as FunctionalComponent<OwnProps>



interface GetConnectionTerminalPositionsArgs
{
    wcomponent: WComponentConnection | WComponentJudgement
    wc_id_map: KnowledgeViewWComponentIdEntryMap
}
function get_connection_terminal_positions ({ wcomponent, wc_id_map }: GetConnectionTerminalPositionsArgs)
{
    let from_node_position: KnowledgeViewWComponentEntry | undefined = undefined
    let to_node_position: KnowledgeViewWComponentEntry | undefined = undefined
    let from_connection_type: ConnectionTerminalType // = "top"
    let to_connection_type: ConnectionTerminalType // = "bottom"

    if (wcomponent_is_plain_connection(wcomponent))
    {
        from_node_position = wc_id_map[wcomponent.from_id]
        to_node_position = wc_id_map[wcomponent.to_id]
        from_connection_type = { direction: "from", attribute: wcomponent.from_type }
        to_connection_type = { direction: "to", attribute: wcomponent.to_type }
    }
    else
    {
        from_node_position = wc_id_map[wcomponent.id]
        to_node_position = wc_id_map[wcomponent.judgement_target_wcomponent_id]
        from_connection_type = { direction: "from", attribute: "meta" }
        to_connection_type = { direction: "to", attribute: "state" }
    }

    return { from_node_position, to_node_position, from_connection_type, to_connection_type }
}
