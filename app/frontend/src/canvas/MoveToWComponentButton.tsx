import { h, FunctionalComponent } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import FilterCenterFocusIcon from "@material-ui/icons/FilterCenterFocus"
import { Box, IconButton } from "@material-ui/core"

import {
    get_current_composed_knowledge_view_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import { lefttop_to_xy, screen_height, screen_width } from "../state/display_options/display"
import type { PositionAndZoom } from "./interfaces"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import { calculate_if_components_on_screen } from "./calculate_if_components_on_screen"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import type { ComposedKnowledgeView } from "../state/derived/State"
import { bound_zoom, SCALE_BY } from "./zoom_utils"
import { NODE_HEIGHT_APPROX, NODE_WIDTH } from "./position_utils"



interface OwnProps
{
    wcomponent_id?: string
    disable_if_not_present?: boolean
    allow_drawing_attention?: boolean
    have_finished_drawing_attention?: () => void
}

const map_state = (state: RootState, own_props: OwnProps) =>
{
    const initial_wcomponent_id = own_props.wcomponent_id
        || state.routing.item_id // selected component id
        || ""


    let components_on_screen: boolean | undefined = undefined
    if (own_props.allow_drawing_attention)
    {
        components_on_screen = calculate_if_components_on_screen(state)
    }


    return {
        initial_wcomponent_id,
        created_at_ms: state.routing.args.created_at_ms,
        components_on_screen,
        current_composed_knowledge_view: get_current_composed_knowledge_view_from_state(state),
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        selected_wcomponent_ids_set: state.meta_wcomponents.selected_wcomponent_ids_set,
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
        components_on_screen,
        have_finished_drawing_attention,
    } = props


    const { position, go_to_datetime_ms } = useMemo(() =>
        calculate_spatial_temporal_position_to_move_to(
            props.current_composed_knowledge_view,
            props.wcomponents_by_id,
            props.initial_wcomponent_id,
            props.selected_wcomponent_ids_set,
            props.created_at_ms,
            props.disable_if_not_present,
        )
    , [
        props.current_composed_knowledge_view,
        props.wcomponents_by_id,
        props.initial_wcomponent_id,
        props.selected_wcomponent_ids_set,
        props.created_at_ms,
        props.disable_if_not_present,
    ])

    const move = !position ? undefined : () => props.move(go_to_datetime_ms, position)

    const draw_attention_to_move_to_wcomponent_button = props.allow_drawing_attention && position && !components_on_screen


    return <MoveToItemButton
        move={move}
        draw_attention={draw_attention_to_move_to_wcomponent_button}
        have_finished_drawing_attention={have_finished_drawing_attention}
    />
}
export const MoveToWComponentButton = connector(_MoveToWComponentButton) as FunctionalComponent<OwnProps>



function calculate_spatial_temporal_position_to_move_to (current_composed_knowledge_view: ComposedKnowledgeView | undefined, wcomponents_by_id: WComponentsById, initial_wcomponent_id: string, selected_wcomponent_ids_set: Set<string>, created_at_ms: number, disable_if_not_present: boolean | undefined)
{
    let wcomponent_created_at_ms: number | undefined = undefined
    let position: PositionAndZoom | undefined = undefined

    const { composed_visible_wc_id_map, wc_ids_by_type } = current_composed_knowledge_view || {}

    if (composed_visible_wc_id_map)
    {
        const wcomponent = wcomponents_by_id[initial_wcomponent_id]
        wcomponent_created_at_ms = wcomponent && get_created_at_ms(wcomponent)
        let view_entry = composed_visible_wc_id_map[initial_wcomponent_id]
        let zoom = SCALE_BY

        if (!view_entry && !disable_if_not_present && wc_ids_by_type)
        {
            const { any_node } = wc_ids_by_type
            const ids = selected_wcomponent_ids_set.size ? selected_wcomponent_ids_set : any_node

            let min_left = Number.POSITIVE_INFINITY
            let max_left = Number.NEGATIVE_INFINITY
            let min_top = Number.POSITIVE_INFINITY
            let max_top = Number.NEGATIVE_INFINITY

            ids.forEach(wcomponent_id =>
            {
                const wcomponent = wcomponents_by_id[wcomponent_id]
                const an_entry = composed_visible_wc_id_map[wcomponent_id]
                if (!wcomponent || !an_entry) return

                min_left = Math.min(min_left, an_entry.left)
                max_left = Math.max(max_left, an_entry.left)
                min_top = Math.min(min_top, an_entry.top)
                max_top = Math.max(max_top, an_entry.top)

                wcomponent_created_at_ms = get_created_at_ms(wcomponent)
            })


            min_left -= NODE_WIDTH
            max_left += NODE_WIDTH
            min_top -= (NODE_HEIGHT_APPROX * 2) // hack as the center of screen seems off
            max_top += NODE_HEIGHT_APPROX


            view_entry =
            {
                left: (min_left + max_left) / 2,
                top: (min_top + max_top) / 2,
            }


            const total_width = max_left - min_left
            const total_height = max_top - min_top
            const zoom_width = (screen_width(false) / total_width) * SCALE_BY
            const zoom_height = (screen_height() / total_height) * SCALE_BY

            zoom = Math.min(zoom_width, zoom_height)
            zoom = bound_zoom(Math.min(SCALE_BY, zoom))
        }

        if (wcomponent_created_at_ms)
        {
            created_at_ms = Math.max(created_at_ms, wcomponent_created_at_ms)
        }

        if (view_entry)
        {
            position = lefttop_to_xy({ ...view_entry, zoom }, true)
        }
    }

    return { position, go_to_datetime_ms: created_at_ms }
}



interface MoveToItemButtonProps
{
    move?: () => void
    draw_attention?: boolean
    have_finished_drawing_attention?: () => void
}
export function MoveToItemButton (props: MoveToItemButtonProps)
{
    const {
        move, draw_attention,
        have_finished_drawing_attention = () => {},
    } = props

    return <Box>
        <Box zIndex={10} m={2} title={move ? "Move to component(s)" : "No component(s) present"}>
            <IconButton
                size="small"
                onClick={move}
                disabled={!move}
            >
                <FilterCenterFocusIcon />
            </IconButton>
        </Box>
        <div
            className={(move && draw_attention) ? "pulsating_circle" : ""}
            ref={e => setTimeout(() =>
            {
                e?.classList.remove("pulsating_circle")
                have_finished_drawing_attention()
            }, 10000)}
        />
    </Box>
}
