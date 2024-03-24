import { FunctionalComponent } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import {
    get_current_composed_knowledge_view_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import type { PositionAndZoom } from "./interfaces"
import { calculate_if_components_on_screen } from "./calculate_if_components_on_screen"
import {
    calculate_all_display_combinations_of_spatial_temporal_position_to_move_to,
} from "./calculate_spatial_temporal_position_to_move_to"
import { get_actually_display_time_sliders } from "../state/controls/accessors"
import { MoveToItemButton } from "./MoveToItemButton"



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


    const {
        positions_no_sidepanel_or_timesliders,
        positions_sidepanel_no_timesliders,
        positions_timesliders_no_sidepanel,
        positions_with_sidepanel_or_timesliders,
        go_to_datetime_ms,
    } = useMemo(() =>
        calculate_all_display_combinations_of_spatial_temporal_position_to_move_to({
            current_composed_knowledge_view,
            wcomponents_by_id,
            initial_wcomponent_id,
            selected_wcomponent_ids_set,
            created_at_ms,
            disable_if_not_present,
        })
    , [
        current_composed_knowledge_view,
        wcomponents_by_id,
        initial_wcomponent_id,
        selected_wcomponent_ids_set,
        created_at_ms,
        disable_if_not_present,
    ])


    const positions = (display_side_panel || display_time_sliders)
        ? (
            (display_side_panel && display_time_sliders)
            ? positions_with_sidepanel_or_timesliders
            : (
                display_side_panel
                ? positions_sidepanel_no_timesliders
                : positions_timesliders_no_sidepanel
            )
        )
        : positions_no_sidepanel_or_timesliders

    let next_position_index = 0
    const move = positions.length === 0
        ? undefined
        : () =>
        {
            let position = positions[next_position_index++]
            if (!position)
            {
                next_position_index = 0
                position = positions[next_position_index++]
            }
            props.move(go_to_datetime_ms, position)
        }


    const draw_attention_to_move_to_wcomponent_button = props.allow_drawing_attention && positions.length > 0 && !components_on_screen


    return <MoveToItemButton
        move={move}
        draw_attention={draw_attention_to_move_to_wcomponent_button}
        have_finished_drawing_attention={have_finished_drawing_attention}
        // Only enable this when the button is used on the main knowledge ContentControls, not the WComponentForm
        enable_spacebar_move_to_shortcut={!props.wcomponent_id}
    />
}
export const MoveToWComponentButton = connector(_MoveToWComponentButton) as FunctionalComponent<OwnProps>
