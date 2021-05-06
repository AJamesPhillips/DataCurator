import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { CanvasConnnection } from "../canvas/CanvasConnnection"
import type { WComponentJudgement } from "../shared/models/interfaces/judgement"
import {
    KnowledgeView,
    KnowledgeViewWComponentEntry,
    WComponent,
    wcomponent_can_render_connection,
    WComponentConnection,
    wcomponent_is_plain_connection,
    ConnectionLocationType,
    wcomponent_is_judgement,
    KnowledgeViewWComponentIdEntryMap,
} from "../shared/models/interfaces/SpecialisedObjects"
import { get_prob_and_conviction } from "../shared/models/uncertainty_utils"
import { get_created_at_ms } from "../shared/models/utils_datetime"
import { ACTIONS } from "../state/actions"
import { get_wcomponent_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { find_nearest_index_in_sorted_list } from "../utils/binary_search"
import { connection_terminal_type_to_location, wcomponent_is_invalid_for_datetime } from "./utils"



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

    let is_invalid = false
    let from_wc: WComponent | undefined = undefined
    let to_wc: WComponent | undefined = undefined

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
                is_invalid = (
                    wcomponent_is_invalid_for_datetime(from_wc, display_at_datetime_ms, sim_ms)
                    || wcomponent_is_invalid_for_datetime(to_wc, display_at_datetime_ms, sim_ms)
                )
            }
        }
    }

    return {
        current_UI_knowledge_view,
        display_at_datetime_ms,
        wc,
        is_invalid,
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
        id, current_UI_knowledge_view, display_at_datetime_ms, wc, is_invalid, is_current_item,
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


    const { from_node_position, to_node_position, from_connection_location, to_connection_location,
    } = get_connection_terminal_positions({ wcomponent: wc, wc_id_map: current_UI_knowledge_view.derived_wc_id_map })

    const { intensity, blur, hidden } = calculate_display_params({ wcomponent: wc, display_at_datetime_ms })


    return <CanvasConnnection
        from_node_position={from_node_position}
        to_node_position={to_node_position}
        from_connection_location={from_connection_location}
        to_connection_location={to_connection_location}
        on_click={on_click}
        hidden={hidden}
        intensity={intensity}
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
    let from_connection_location: ConnectionLocationType = "top"
    let to_connection_location: ConnectionLocationType = "bottom"

    if (wcomponent_is_plain_connection(wcomponent))
    {
        from_node_position = wc_id_map[wcomponent.from_id]
        to_node_position = wc_id_map[wcomponent.to_id]
        from_connection_location = connection_terminal_type_to_location(wcomponent.from_type, from_connection_location)
        to_connection_location = connection_terminal_type_to_location(wcomponent.to_type, to_connection_location)
    }
    else if (wcomponent_is_judgement(wcomponent))
    {
        from_node_position = wc_id_map[wcomponent.id]
        to_node_position = wc_id_map[wcomponent.judgement_target_wcomponent_id]
        to_connection_location = "left"
    }

    return { from_node_position, to_node_position, from_connection_location, to_connection_location }
}



interface CalculateIntensityBlurArgs
{
    wcomponent: WComponentConnection | WComponentJudgement
    display_at_datetime_ms: number
}
function calculate_display_params ({ wcomponent, display_at_datetime_ms }: CalculateIntensityBlurArgs)
{
    let intensity = 1 // out of 1
    let blur = 0      // out of 100
    let hidden = false

    if (wcomponent_is_plain_connection(wcomponent))
    {
        // TODO use validity in calculation as well
        const { validity = [], existence = [] } = wcomponent
        const prediction_index_result = find_nearest_index_in_sorted_list(existence, p => get_created_at_ms(p), display_at_datetime_ms)
        const prediction = existence[Math.floor(prediction_index_result.index)]


        hidden = existence.length > 0 && !prediction

        const { probability, conviction } = get_prob_and_conviction(prediction)

        intensity = probability
        blur = 50 - ((conviction * 100) / 2)
    }

    return { intensity, hidden, blur }
}
