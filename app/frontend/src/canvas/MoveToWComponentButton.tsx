import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"
import FilterCenterFocusIcon from "@material-ui/icons/FilterCenterFocus"
import { Box, IconButton } from "@material-ui/core"

import {
    get_current_composed_knowledge_view_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import { lefttop_to_xy } from "../state/display_options/display"
import type { PositionAndZoom } from "./interfaces"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import { calculate_if_components_on_screen } from "./calculate_if_components_on_screen"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { useMemo } from "preact/hooks"
import type { KnowledgeViewWComponentIdEntryMap } from "../shared/interfaces/knowledge_view"



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


    let components_on_screen: boolean | undefined = undefined
    if (own_props.allow_drawing_attention)
    {
        components_on_screen = calculate_if_components_on_screen(state)
    }


    return {
        initial_wcomponent_id,
        created_at_ms: state.routing.args.created_at_ms,
        components_on_screen,
        composed_visible_wc_id_map: get_current_composed_knowledge_view_from_state(state)?.composed_visible_wc_id_map,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
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
        calculate_spatial_temporal_position_to_move_to(props.composed_visible_wc_id_map, props.wcomponents_by_id, props.initial_wcomponent_id, props.created_at_ms)
    , [props.composed_visible_wc_id_map, props.wcomponents_by_id, props.initial_wcomponent_id, props.created_at_ms])

    const move = () => position && props.move(go_to_datetime_ms, position)

    const draw_attention_to_move_to_wcomponent_button = props.allow_drawing_attention && position && !components_on_screen


    return <MoveToItemButton
        position={position}
        move={move}
        draw_attention={draw_attention_to_move_to_wcomponent_button}
        have_finished_drawing_attention={have_finished_drawing_attention}
    />
}
export const MoveToWComponentButton = connector(_MoveToWComponentButton) as FunctionalComponent<OwnProps>



function calculate_spatial_temporal_position_to_move_to (composed_visible_wc_id_map: KnowledgeViewWComponentIdEntryMap | undefined, wcomponents_by_id: WComponentsById, initial_wcomponent_id: string, go_to_datetime_ms: number)
{
    let wcomponent_created_at_ms: number | undefined = undefined
    let position: PositionAndZoom | undefined = undefined

    if (composed_visible_wc_id_map)
    {
        let wcomponent = wcomponents_by_id[initial_wcomponent_id]
        wcomponent_created_at_ms = wcomponent && get_created_at_ms(wcomponent)
        let view_entry = composed_visible_wc_id_map[initial_wcomponent_id]

        if (!view_entry)
        {
            Object.entries(composed_visible_wc_id_map)
                .find(([wcomponent_id, an_entry]) =>
                {
                    wcomponent = wcomponents_by_id[wcomponent_id]
                    wcomponent_created_at_ms = wcomponent && get_created_at_ms(wcomponent)

                    view_entry = an_entry
                    return true
                })
        }

        if (wcomponent_created_at_ms)
        {
            go_to_datetime_ms = Math.max(go_to_datetime_ms, wcomponent_created_at_ms)
        }

        if (view_entry)
        {
            position = lefttop_to_xy({ ...view_entry, zoom: 100 }, true)
        }
    }

    return { position, go_to_datetime_ms }
}




interface MoveToItemButtonProps
{
    position: PositionAndZoom | undefined
    move?: () => void
    draw_attention?: boolean
    have_finished_drawing_attention?: () => void
}
export function MoveToItemButton (props: MoveToItemButtonProps)
{
    const {
        position, move, draw_attention,
        have_finished_drawing_attention = () => {},
    } = props

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
            className={draw_attention ? "pulsating_circle" : ""}
            ref={e => setTimeout(() =>
            {
                e?.classList.remove("pulsating_circle")
                have_finished_drawing_attention()
            }, 10000)}
        />
    </Box>
}
