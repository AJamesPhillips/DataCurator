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
import type { PositionAndZoom } from "./interfaces"
import { calculate_if_components_on_screen } from "./calculate_if_components_on_screen"
import { calculate_spatial_temporal_position_to_move_to } from "./calculate_spatial_temporal_position_to_move_to"
import { get_actually_display_time_sliders } from "../state/controls/accessors"



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
        display_side_panel: state.controls.display_side_panel,
        display_time_sliders: get_actually_display_time_sliders(state),
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
        current_composed_knowledge_view,
        wcomponents_by_id,
        initial_wcomponent_id,
        selected_wcomponent_ids_set,
        created_at_ms,
        disable_if_not_present,
        display_side_panel,
        display_time_sliders,
    } = props


    const { positions, go_to_datetime_ms } = useMemo(() =>
        calculate_spatial_temporal_position_to_move_to({
            current_composed_knowledge_view,
            wcomponents_by_id,
            initial_wcomponent_id,
            selected_wcomponent_ids_set,
            created_at_ms,
            disable_if_not_present,
            display_side_panel,
            display_time_sliders,
        })
    , [
        current_composed_knowledge_view,
        wcomponents_by_id,
        initial_wcomponent_id,
        selected_wcomponent_ids_set,
        created_at_ms,
        disable_if_not_present,
        // Ideallly these would be used lazily, i.e. after a request to move to components, then if these
        // values had changed, only then would the positions be updated... otherwise every time the side
        // panel is moved in and out, all the components are iterated through which might have bad performance
        // for large maps
        // //
        // // Disabled for now as calculate_spatial_temporal_position_to_move_to doesn't use them properly anyway
        // display_side_panel,
        // display_time_sliders,
    ])


    let next_position_index = 0
    const move = positions.length === 0
        ? undefined
        : () =>
        {
            let position = positions[next_position_index++]
            if (next_position_index >= positions.length) next_position_index = 0
            props.move(go_to_datetime_ms, position)
        }


    const draw_attention_to_move_to_wcomponent_button = props.allow_drawing_attention && positions && !components_on_screen


    return <MoveToItemButton
        move={move}
        draw_attention={draw_attention_to_move_to_wcomponent_button}
        have_finished_drawing_attention={have_finished_drawing_attention}
    />
}
export const MoveToWComponentButton = connector(_MoveToWComponentButton) as FunctionalComponent<OwnProps>



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
