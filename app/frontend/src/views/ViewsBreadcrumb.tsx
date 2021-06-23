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



const map_state = (state: RootState) =>
{
    const kv = get_current_knowledge_view_from_state(state)

    return {
        ready: state.sync.ready,
        presenting: state.display_options.consumption_formatting,
        view: state.routing.args.view,
        kv,
    }
}

const map_dispatch = {
    toggle_consumption_formatting: ACTIONS.display.toggle_consumption_formatting,
    change_route: ACTIONS.routing.change_route,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function navigate_view(event:Event, props:any)
{
    let target:HTMLElement = event.target as HTMLElement;
    if (target instanceof HTMLSelectElement) {
        const select = target as HTMLSelectElement;
        const view = select.value;
        props.change_route({ args: { view } })
    }
}

function _ViewsBreadcrumb (props: Props)
{
    if (!props.ready) return null

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
            <select name="select_view" onChange={(e:Event) => { navigate_view(e, props) }}>
                {view_options.map(opt => <option value={opt.id}>{opt.title}</option>)}
            </select>
            <strong>{props.kv && props.kv.title.slice(0, 20)}</strong>
        </Breadcrumbs>
    </div>
}

export const ViewsBreadcrumb = connector(_ViewsBreadcrumb) as FunctionalComponent<{}>



const view_options: { id: ViewType, title: string }[] = [
    { id: "knowledge", title: "Knowledge" },
    { id: "priorities", title: "Priorities" },
    { id: "priorities_list", title: "Priorities list" },
]
