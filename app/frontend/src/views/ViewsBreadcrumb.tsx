import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { Box, Breadcrumbs, MenuItem, Select, Typography } from "@material-ui/core"

import { AutocompleteText, OPTION_NONE_ID } from "../form/Autocomplete/AutocompleteText"
import { ACTIONS } from "../state/actions"
import type { NestedKnowledgeViewEntry, NestedKnowledgeViewsList } from "../state/derived/State"
import type { ViewType } from "../state/routing/interfaces"
import type { RootState } from "../state/State"
import type { Color } from "../shared/interfaces/color"
import { get_path } from "../knowledge_view/utils/get_path"



const map_state = (state: RootState) =>
{
    const kv_id = state.routing.args.subview_id

    return {
        ready_for_reading: state.sync.ready_for_reading,
        presenting: state.display_options.consumption_formatting,
        view: state.routing.args.view,
        kv_id,
        nested_kv_list: state.derived.nested_knowledge_views,
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

    const { kv_id, nested_kv_list } = props

    const levels: Level[] = get_levels(nested_kv_list, kv_id)

    return <Breadcrumbs>
        <Box>
            <Select
                label={<Typography noWrap={true}>View Type:</Typography>}
                name="select_view"
                // onChange={e => navigate_view(e, props) }
                value={props.view}
            >
                {view_options.map(opt => <MenuItem
                    value={opt.id}
                    selected={opt.id === props.view}
                    onPointerDown={(e: h.JSX.TargetedEvent<HTMLDivElement, MouseEvent>) =>
                    {
                        e.stopImmediatePropagation()
                        props.change_route({ args: { view: opt.id } })
                    }}
                >
                    {opt.title}
                </MenuItem>)}
            </Select>
        </Box>
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
                force_editable={true}
                threshold_minimum_score={false}
                retain_options_order={true}
            />
        </Box>
        )}
    </Breadcrumbs>
}

export const ViewsBreadcrumb = connector(_ViewsBreadcrumb) as FunctionalComponent<{}>



const view_options: { id: ViewType, title: string }[] = [
    { id: "knowledge", title: "Knowledge" },
    { id: "priorities", title: "Priorities" },
    { id: "priorities_list", title: "Priorities list" },
    { id: "actions_list", title: "Actions list" },
]



interface KnowledgeViewOption
{
    id: string
    title: string
    is_hidden: boolean
    color?: Color
}

function calc_if_is_hidden (entry: NestedKnowledgeViewEntry): KnowledgeViewOption
{
    const is_hidden = entry.sort_type === "hidden" || entry.sort_type === "archived" || entry.sort_type === "errored"
    const color = entry.sort_type === "errored" ? pink : undefined
    return { id: entry.id, title: entry.title, is_hidden, color }
}

const pink: Color = { r: 231, g: 190, b: 201, a: 1 }



function get_levels (nested_kv_list: NestedKnowledgeViewsList, kv_id: string): Level[]
{
    const path = get_path(nested_kv_list, kv_id)
    let options: KnowledgeViewOption[] = nested_kv_list.map(calc_if_is_hidden)
    let parent_id: string | undefined = OPTION_NONE_ID

    return path.map(entry =>
    {
        const level: Level = {
            options,
            selected_id: entry.id,
            parent_id,
        }

        options = (entry.children_list || []).map(calc_if_is_hidden)
        parent_id = entry.id

        return level
    })
}
