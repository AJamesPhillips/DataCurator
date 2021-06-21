import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./ViewsBreadcrumb.css"
import { sentence_case } from "../shared/utils/sentence_case"
import { get_current_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"



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

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>



function _ViewsBreadcrumb (props: Props)
{
    if (!props.ready) return null


    return <div className="view_breadcrumb">
        <div className={props.presenting ? "presenting" : "editing"}>
            {props.presenting ? "Presenting" : "Editing"}
        </div>

        <div className="routing">
            <div>
                {sentence_case(props.view).replaceAll("_", " ")}
            </div>
            /
            <div>
                {props.kv && props.kv.title.slice(0, 20)}
            </div>
        </div>
    </div>
}

export const ViewsBreadcrumb = connector(_ViewsBreadcrumb) as FunctionalComponent<{}>
