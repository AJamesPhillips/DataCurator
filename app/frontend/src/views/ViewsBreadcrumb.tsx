import { Box, Breadcrumbs, MenuItem, Select, Typography } from "@mui/material"
import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText, OPTION_NONE_ID } from "../form/Autocomplete/AutocompleteText"
import type { Color } from "../shared/interfaces/color"
import { is_defined } from "../shared/utils/is_defined"
import { ACTIONS } from "../state/actions"
import type { NestedKnowledgeViewIdsEntry } from "../state/derived/State"
import { experimental_features } from "../state/display_options/persistance"
import type { ViewType } from "../state/routing/interfaces"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
{
    const kv_id = state.routing.args.subview_id

    return {
        ready_for_reading: state.sync.ready_for_reading,
        presenting: state.display_options.consumption_formatting,
        view: state.routing.args.view,
        kv_id,
        nested_kv_ids_map: state.derived.nested_knowledge_view_ids,
    }
}

const map_dispatch = {
    toggle_consumption_formatting: ACTIONS.display.toggle_consumption_formatting,
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


/*
function navigate_view (event: h.JSX.TargetedEvent<HTMLSelectElement, Event>, props: Props)
{
    const select_el = event.currentTarget
    if (!select_el) return

    const view = select_el.value as ViewType
    props.change_route({ args: { view } })
}
*/

interface Level
{
    options: KnowledgeViewOption[]
    selected_id: string | undefined
    parent_id: string | undefined
}


function _ViewsBreadcrumb (props: Props)
{
    if (!props.ready_for_reading) return null

    const { kv_id, nested_kv_ids_map } = props
    let nested_kv = nested_kv_ids_map.map[kv_id]

    const levels: Level[] = []
    let last_parent_id: string | undefined = OPTION_NONE_ID

    while (nested_kv)
    {
        const entries = nested_kv.child_ids
            .map(id => nested_kv_ids_map.map[id])
            .filter(is_defined)

        if (entries.length)
        {
            const options = entries.map(calc_if_is_hidden)

            levels.unshift({
                options,
                selected_id: last_parent_id,
                parent_id: nested_kv.id,
            })
        }
        last_parent_id = nested_kv.id

        nested_kv = nested_kv.parent_id !== undefined ? nested_kv_ids_map.map[nested_kv.parent_id] : undefined
    }

    const top_level_options = nested_kv_ids_map.top_ids.map(id => nested_kv_ids_map.map[id])
        .filter(is_defined)
        .map(calc_if_is_hidden)
    levels.unshift({ options: top_level_options, selected_id: last_parent_id, parent_id: undefined })

    const show_view_type_selector = props.view !== "knowledge" || view_options_selectable.length > 1

    return <Breadcrumbs style={{ marginTop: "8px" }}>
        {show_view_type_selector && <Box>
            <Select
                variant="standard"
                label={<Typography noWrap={true}>View Type:</Typography>}
                name="select_view"
                // onChange={e => navigate_view(e, props) }
                value={props.view}
            >
                {view_options.map(opt => <MenuItem
                    value={opt.id}
                    selected={opt.id === props.view}
                    disabled={!opt.selectable}
                    onPointerDown={e =>
                    {
                        e.stopImmediatePropagation()
                        props.change_route({ args: { view: opt.id } })
                    }}
                >
                    {opt.title}
                </MenuItem>)}
            </Select>
        </Box>}
        {levels.map(level => <Box>
            <AutocompleteText
                allow_none={level.parent_id !== undefined}
                selected_option_id={level.selected_id}
                options={level.options}
                on_change={subview_id =>
                    props.change_route({ args: { subview_id: subview_id || level.parent_id } })
                }
                on_choose_same={subview_id =>
                    props.change_route({ args: { subview_id: subview_id || level.parent_id } })
                }
                editing_allowed={true}
                threshold_minimum_score={false}
                retain_options_order={true}
            />
        </Box>
        )}
    </Breadcrumbs>
}

export const ViewsBreadcrumb = connector(_ViewsBreadcrumb) as FunctionalComponent


const state = experimental_features.get_state()
const view_options: { id: ViewType, title: string, selectable: boolean }[] = [
    { id: "knowledge", title: "Knowledge", selectable: true },
    { id: "actions_list", title: "Actions list", selectable: state.enable_action_kanban_view },
]
const view_options_selectable = view_options.filter(opt => opt.selectable)


interface KnowledgeViewOption
{
    id: string
    title: string
    is_hidden: boolean
    color?: Color
}

function calc_if_is_hidden (entry: NestedKnowledgeViewIdsEntry): KnowledgeViewOption
{
    const is_hidden = entry.sort_type === "hidden" || entry.sort_type === "archived" || entry.sort_type === "errored"
    const color = entry.sort_type === "errored" ? pink : undefined
    return { id: entry.id, title: entry.title, is_hidden, color }
}

const pink: Color = { r: 231, g: 190, b: 201, a: 1 }
