import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { CanvasConnnection } from "../canvas/connections/CanvasConnnection"
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
import { get_created_at_ms } from "../shared/wcomponent/utils_datetime"
import { ACTIONS } from "../state/actions"
import { get_wcomponent_counterfactuals } from "../state/derived/accessor"
import { get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import {
    wcomponent_is_not_yet_created,
} from "./utils"



interface OwnProps
{
    id: string
}


const map_state = (state: RootState, props: OwnProps) =>
{
    const { current_UI_knowledge_view } = state.derived

    const display_at_datetime_ms = state.routing.args.created_at_ms
    const sim_ms = state.routing.args.sim_ms
    const wc = get_wcomponent_from_state(state, props.id)

    let is_not_created = false
    let is_invalid = false
    let probability = 1
    let conviction = 1
    let from_wc: WComponent | undefined = undefined
    let to_wc: WComponent | undefined = undefined
    const wc_counterfactuals = get_wcomponent_counterfactuals(state, props.id)

    if (wc)
    {
        is_invalid = get_created_at_ms(wc) > display_at_datetime_ms

        if (!is_invalid && wcomponent_is_plain_connection(wc))
        {
            from_wc = get_wcomponent_from_state(state, wc.from_id)
            to_wc = get_wcomponent_from_state(state, wc.to_id)

            if (!from_wc || !to_wc) is_invalid = true
            else
            {
                is_not_created = (
                    wcomponent_is_not_yet_created(from_wc, display_at_datetime_ms)
                    || wcomponent_is_not_yet_created(to_wc, display_at_datetime_ms)
                )
                const wc_from_counterfactuals = get_wcomponent_counterfactuals(state, wc.from_id)

                const ex = wcomponent_is_not_yet_created(wc, display_at_datetime_ms)
                const ex_from_con = wcomponent_is_not_yet_created(from_wc, display_at_datetime_ms)

                probability = 1 // Math.min(ex.existence, ex_from_con.existence)
                conviction = 1 // Math.min(ex.conviction, ex_from_con.conviction)
            }
        }
    }

    return {
        current_UI_knowledge_view,
        wc,
        is_invalid,
        probability,
        conviction,
        is_current_item: state.routing.item_id === props.id,
    }
}


const map_dispatch = {
    clicked_wcomponent: ACTIONS.specialised_object.clicked_wcomponent,
    change_route: ACTIONS.routing.change_route,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCanvasConnection (props: Props)
{
    const {
        id, current_UI_knowledge_view, wc, is_invalid, is_current_item, probability, conviction,
        clicked_wcomponent, change_route,
    } = props

    if (!wc)
    {
        console.error(`Tried to render a WComponentCanvasConnection of world component id: "${id}" but could not find it`)
        return null
    }

    if (!wcomponent_can_render_connection(wc))
    {
        console.error(`Tried to render a WComponentCanvasConnection of world component id: "${id}" but was not a causal link`)
        return null
    }

    if (is_invalid) return null

    if (!current_UI_knowledge_view)
    {
        console.error(`Tried to render a WComponentCanvasConnection of world component id: "${id}" but no current_UI_knowledge_view`)
        return null
    }


    const on_click = () =>
    {
        clicked_wcomponent({ id })
        change_route({ route: "wcomponents", item_id: id })
    }


    const { from_node_position, to_node_position, from_connection_type, to_connection_type,
    } = get_connection_terminal_positions({ wcomponent: wc, wc_id_map: current_UI_knowledge_view.derived_wc_id_map })


    const blur = 50 - ((conviction * 100) / 2)


    return <CanvasConnnection
        from_node_position={from_node_position}
        to_node_position={to_node_position}
        from_connection_type={from_connection_type}
        to_connection_type={to_connection_type}
        on_click={on_click}
        intensity={probability}
        blur={blur}
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
