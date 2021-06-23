import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_current_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import type { ViewType } from "../state/routing/interfaces"

import Breadcrumbs from "@material-ui/core/Breadcrumbs"
import ToggleButton from "@material-ui/lab/ToggleButton"
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup"
import EditIcon from "@material-ui/icons/Edit"
import PresentToAllIcon from "@material-ui/icons/PresentToAll"
import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { is_defined } from "../shared/utils/is_defined"
import type { NestedKnowledgeViewIdsEntry, NestedKnowledgeViewIdsMap } from "../state/derived/State"



const map_state = (state: RootState) =>
{
    const kv_id = state.routing.args.subview_id

    return {
        ready: state.sync.ready,
        presenting: state.display_options.consumption_formatting,
        view: state.routing.args.view,
        kv_id,
        nested_knowledge_view_ids_map: state.derived.nested_knowledge_view_ids_map,
    }
}

const map_dispatch = {
    toggle_consumption_formatting: ACTIONS.display.toggle_consumption_formatting,
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function navigate_view (event: h.JSX.TargetedEvent<HTMLSelectElement, Event>, props: Props)
{
    const select_el = event.currentTarget
    if (!select_el) return

    const view = select_el.value as ViewType
    props.change_route({ args: { view } })
}

function _ViewsBreadcrumb (props: Props)
{
    if (!props.ready) return null

    const { kv_id, nested_knowledge_view_ids_map: map } = props



    let nested_kv = map.map[kv_id]

    const levels: { entries: NestedKnowledgeViewIdsEntry[], selected_id: string, allow_none: boolean }[] = []
    let deepest_level = true
    let last_parent_id = ""

    while (nested_kv)
    {
        const child_level_options = nested_kv.child_ids
            .map(id => map.map[id])
            .filter(is_defined)

        if (child_level_options.length)
        {
            levels.unshift({ entries: child_level_options, selected_id: last_parent_id, allow_none: deepest_level })
        }
        deepest_level = false
        last_parent_id = nested_kv.id

        nested_kv = nested_kv.parent_id !== undefined ? map.map[nested_kv.parent_id] : undefined
    }

    const top_level = map.top_ids.map(id => map.map[id]).filter(is_defined)
    levels.unshift({ entries: top_level, selected_id: last_parent_id, allow_none: false  })



    return  <div class="breadcrumbs">
        <Breadcrumbs aria-label="breadcrumb">
            <ToggleButtonGroup
                size="small"
                exclusive
                onChange={props.toggle_consumption_formatting}
                value={props.presenting ? "presenting" : "editing"}
                aria-label="text formatting"
            >
                <ToggleButton value="editing" aria-label="Editing">
                    <EditIcon />
                </ToggleButton>
                <ToggleButton value="presenting" aria-label="Presenting">
                    <PresentToAllIcon />
                </ToggleButton>
            </ToggleButtonGroup>
            <select name="select_view" onChange={e => navigate_view(e, props) }>
                {view_options.map(opt => <option value={opt.id}>{opt.title}</option>)}
            </select>
            {levels.map(options => <AutocompleteText
                allow_none={options.allow_none}
                selected_option_id={options.selected_id}
                options={options.entries}
                on_change={subview_id => props.change_route({ args: { subview_id } })}
            />
            )}
        </Breadcrumbs>
    </div>
}

export const ViewsBreadcrumb = connector(_ViewsBreadcrumb) as FunctionalComponent<{}>



const view_options: { id: ViewType, title: string }[] = [
    { id: "knowledge", title: "Knowledge" },
    { id: "priorities", title: "Priorities" },
    { id: "priorities_list", title: "Priorities list" },
]



function get_nested_kv (nested_knowledge_view_ids_map: NestedKnowledgeViewIdsMap, id: string | undefined)
{
    if (!id) return undefined
    return nested_knowledge_view_ids_map.map[id]
}
