import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./ViewsBreadcrumb.css"
import { sentence_case } from "../shared/utils/sentence_case"
import { get_current_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import type { ViewType } from "../state/routing/interfaces"



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



function _ViewsBreadcrumb (props: Props)
{
    if (!props.ready) return null


    return <div className="view_breadcrumb">
        <div className={props.presenting ? "presenting" : "editing"}>
            <Button
                value={props.presenting ? "Presenting" : "Editing"}
                on_pointer_down={props.toggle_consumption_formatting}
            />
        </div>

        <div className="routing">
            <div>
                <AutocompleteText
                    placeholder=""
                    selected_option_id={props.view}
                    options={view_options}
                    allow_none={false}
                    on_change={view =>
                    {
                        if (!view) return
                        props.change_route({ args: { view } })
                    }}
                />
            </div>
            /
            <div>
                {props.kv && props.kv.title.slice(0, 20)}
            </div>
        </div>
    </div>
}

export const ViewsBreadcrumb = connector(_ViewsBreadcrumb) as FunctionalComponent<{}>



const view_options: { id: ViewType, title: string }[] = [
    { id: "knowledge", title: "Knowledge" },
    { id: "priorities", title: "Priorities" },
    { id: "priorities_list", title: "Priorities list" },
]
