import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"
import FilterCenterFocusIcon from "@material-ui/icons/FilterCenterFocus"
import { Box, IconButton } from "@material-ui/core"

import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponent_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import { lefttop_to_xy } from "../state/display_options/display"
import type { PositionAndZoom } from "./interfaces"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import { calculate_if_components_on_screen } from "./calculate_if_components_on_screen"



interface OwnProps
{
    wcomponent_id?: string
    allow_drawing_attention?: boolean
    have_finished_drawing_attention?: () => void
}

const map_state = (state: RootState, own_props: OwnProps) =>
{
    const initial_wcomponent_id = own_props.wcomponent_id
        || state.routing.item_id // selected component id
        || ""
    let go_to_datetime_ms = state.routing.args.created_at_ms

    let wcomponent_created_at_ms: number | undefined = undefined
    let position: PositionAndZoom | undefined = undefined


    const current_composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
    if (current_composed_knowledge_view)
    {
        let wcomponent = get_wcomponent_from_state(state, initial_wcomponent_id)
        wcomponent_created_at_ms = wcomponent && get_created_at_ms(wcomponent)
        let view_entry = current_composed_knowledge_view.composed_wc_id_map[initial_wcomponent_id]

        if (!view_entry)
        {
            Object.keys(current_composed_knowledge_view.composed_wc_id_map || {})
                .find(wcomponent_id =>
                {
                    const excluded = current_composed_knowledge_view.filters.wc_ids_excluded_by_any_filter.has(wcomponent_id)
                    if (excluded) return false

                    wcomponent = get_wcomponent_from_state(state, wcomponent_id)
                    if (!wcomponent) return false
                    wcomponent_created_at_ms = get_created_at_ms(wcomponent)

                    view_entry = current_composed_knowledge_view.composed_wc_id_map[wcomponent_id]
                    return !!view_entry
                })
        }

        if (wcomponent_created_at_ms)
        {
            go_to_datetime_ms = Math.max(go_to_datetime_ms, wcomponent_created_at_ms)
        }

        if (view_entry)
        {
            position = {
                ...view_entry,
                zoom: 100,
            }
        }
    }


    let components_on_screen: boolean | undefined = undefined
    if (position)
    {
        components_on_screen = calculate_if_components_on_screen(state)
    }


    return {
        go_to_datetime_ms,
        position: lefttop_to_xy(position, true),
        components_on_screen,
    }
}


const map_dispatch = {
    move: (datetime_ms: number, position?: PositionAndZoom) => ACTIONS.routing.change_route({
        args: {
            created_at_ms: datetime_ms,
            ...position
        },
    })
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _MoveToWComponentButton (props: Props)
{
    const {
        go_to_datetime_ms, position, components_on_screen,
        have_finished_drawing_attention = () => {},
    } = props

    const move = () => position && props.move(go_to_datetime_ms, position)

    const draw_attention_to_move_to_wcomponent_button = props.allow_drawing_attention && position && !components_on_screen


    return <Box>
        <Box zIndex={10} m={2} title={position ? "Move to component(s)" : "No components present"}>
            <IconButton
                size="small"
                onClick={move}
                disabled={!position}
            >
                <FilterCenterFocusIcon />
            </IconButton>
        </Box>
        <div
            className={draw_attention_to_move_to_wcomponent_button ? "pulsating_circle" : ""}
            ref={e => setTimeout(() =>
            {
                e?.classList.remove("pulsating_circle")
                have_finished_drawing_attention()
            }, 10000)}
        />
    </Box>
}
export const MoveToWComponentButton = connector(_MoveToWComponentButton) as FunctionalComponent<OwnProps>
