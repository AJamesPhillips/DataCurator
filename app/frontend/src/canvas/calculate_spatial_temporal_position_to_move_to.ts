import type { KnowledgeViewWComponentIdEntryMap } from "../shared/interfaces/knowledge_view"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import type { ComposedKnowledgeView } from "../state/derived/State"
import {
    get_screen_width,
    lefttop_to_xy,
    get_visible_screen_height,
    TOP_HEADER_FUDGE,
} from "../state/display_options/display"
import type { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import type { PositionAndZoom } from "./interfaces"
import { NODE_WIDTH, HALF_NODE_HEIGHT } from "./position_utils"
import { SCALE_BY, bound_zoom } from "./zoom_utils"



interface CalculateSpatialTemporalPositionToMoveToArgs
{
    current_composed_knowledge_view: ComposedKnowledgeView | undefined
    wcomponents_by_id: WComponentsById
    initial_wcomponent_id: string
    selected_wcomponent_ids_set: Set<string>
    created_at_ms: number
    disable_if_not_present: boolean | undefined
    display_side_panel: boolean
    display_time_sliders: boolean
}
export function calculate_spatial_temporal_position_to_move_to (args: CalculateSpatialTemporalPositionToMoveToArgs)
{
    const {
        current_composed_knowledge_view,
        wcomponents_by_id,
        initial_wcomponent_id,
        disable_if_not_present,
    } = args
    let { created_at_ms, selected_wcomponent_ids_set } = args

    let wcomponent_created_at_ms: number | undefined = undefined
    let positions: PositionAndZoom[] = []

    const { composed_wc_id_map, wc_ids_by_type } = current_composed_knowledge_view || {}

    if (composed_wc_id_map)
    {
        const wcomponent = wcomponents_by_id[initial_wcomponent_id]
        wcomponent_created_at_ms = wcomponent && get_created_at_ms(wcomponent)
        let view_entry = composed_wc_id_map[initial_wcomponent_id]
        let zoom = SCALE_BY


        const { any_node = new Set<string>() } = wc_ids_by_type || {}
        // Remove the initial_wcomponent_id as it may be selected but present in a different
        // knowledge view
        selected_wcomponent_ids_set = new Set(selected_wcomponent_ids_set)
        selected_wcomponent_ids_set.delete(initial_wcomponent_id)


        if (view_entry)
        {
            const position_and_zoom = lefttop_to_xy({ ...view_entry, zoom }, true)
            positions.push(position_and_zoom)
        }
        else if (!disable_if_not_present)
        {
            let result = calculate_position_groups_with_zoom(selected_wcomponent_ids_set, wcomponents_by_id, composed_wc_id_map,
                // Disabled for now as not using them properly
                // args.display_side_panel, args.display_time_sliders)
                false, false)

            if (result.position_groups.length === 0)
            {
                result = calculate_position_groups_with_zoom(any_node, wcomponents_by_id, composed_wc_id_map,
                    // Disabled for now as not using them properly
                    // args.display_side_panel, args.display_time_sliders)
                    false, false)
            }

            wcomponent_created_at_ms = result.wcomponent_created_at_ms

            positions = result.position_groups.map(group =>
            {
                return lefttop_to_xy({
                    left: (group.min_left + group.max_left) / 2,
                    top: (group.min_top + group.max_top) / 2,
                    zoom: group.zoom,
                }, true)
            })
        }


        if (wcomponent_created_at_ms)
        {
            created_at_ms = Math.max(created_at_ms, wcomponent_created_at_ms)
        }
    }

    return { positions, go_to_datetime_ms: created_at_ms }
}



interface PositionGroup
{
    min_left: number
    max_left: number
    min_top: number
    max_top: number
}


interface PositionGroupAndZoom extends PositionGroup
{
    zoom: number
}
interface CalculatePositionGroupsWithZoomReturn
{
    position_groups: PositionGroupAndZoom[]
    wcomponent_created_at_ms: number | undefined
}

function calculate_position_groups_with_zoom (ids: Set<string>, wcomponents_by_id: WComponentsById, composed_wc_id_map: KnowledgeViewWComponentIdEntryMap, display_side_panel: boolean, display_time_sliders: boolean): CalculatePositionGroupsWithZoomReturn
{
    const position_groups: PositionGroupAndZoom[] = []


    const NODE_WIDTH2 = NODE_WIDTH * 2
    const top_min_fudge = HALF_NODE_HEIGHT + TOP_HEADER_FUDGE
    const top_max_add = HALF_NODE_HEIGHT * 3  // 1.5x node height

    let wcomponent_created_at_ms: number | undefined


    ids.forEach(wcomponent_id => {
        const wcomponent = wcomponents_by_id[wcomponent_id]
        const an_entry = composed_wc_id_map[wcomponent_id]
        if (!wcomponent || !an_entry) return

        const component_min_left = an_entry.left - NODE_WIDTH
        const component_max_left = an_entry.left + NODE_WIDTH2
        const component_min_top = an_entry.top - top_min_fudge
        const component_max_top = an_entry.top + top_max_add


        const fit = position_groups.find(group =>
        {
            const candidate_group: PositionGroup =
            {
                min_left: Math.min(group.min_left, component_min_left),
                max_left: Math.max(group.max_left, component_max_left),
                min_top: Math.min(group.min_top, component_min_top),
                max_top: Math.max(group.max_top, component_max_top),
            }

            const { zoom, fits } = calculate_zoom_to_contain_group(candidate_group, display_side_panel, display_time_sliders)

            if (!fits) return false

            group.min_left = candidate_group.min_left
            group.max_left = candidate_group.max_left
            group.min_top = candidate_group.min_top
            group.max_top = candidate_group.max_top
            group.zoom = zoom
            return true
        })


        // The `< 10 check` is a quick hack to prevent this for locking up with very large maps
        if (!fit && position_groups.length < 10)
        {
            const new_group: PositionGroupAndZoom =
            {
                min_left: component_min_left,
                max_left: component_max_left,
                min_top: component_min_top,
                max_top: component_max_top,
                zoom: SCALE_BY,
            }

            position_groups.push(new_group)
        }


        wcomponent_created_at_ms = get_created_at_ms(wcomponent)
    })

    return { position_groups, wcomponent_created_at_ms }
}



function calculate_zoom_to_contain_group (group: PositionGroup, display_side_panel: boolean, display_time_sliders: boolean)
{
    const total_width = group.max_left - group.min_left
    const total_height = group.max_top - group.min_top
    const zoom_width = (get_screen_width(display_side_panel) / total_width) * SCALE_BY
    const zoom_height = (get_visible_screen_height(display_time_sliders) / total_height) * SCALE_BY

    const raw_zoom = Math.min(zoom_width, zoom_height)
    const bounded_zoom = bound_zoom(Math.min(SCALE_BY, raw_zoom))
    return { zoom: bounded_zoom, fits: raw_zoom >= bounded_zoom }
}
