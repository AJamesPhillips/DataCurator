import type { FunctionalComponent } from "preact"
import { h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { EditableText } from "../form/editable_text/EditableText"
import { WComponentFromTo } from "../knowledge/WComponentFromTo"
import { WComponentForm } from "../knowledge/wcomponent_form/WComponentForm"
import { get_title } from "../shared/wcomponent/rich_text/get_rich_text"


import type { RootState } from "../state/State"

import "./SandBox.css"



const map_state = (state: RootState) =>
{
    const ready = state.sync.ready

    return {
        ready,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        wcomponent: state.specialised_objects.wcomponents_by_id["wc33659374739333304"]
    }
}



const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux


function _SandBoxConnected (props: Props)
{
    const { wcomponent, wcomponents_by_id } = props

    if (!props.ready || !wcomponent) return <div>loading...</div>
    const editing = false
    const wc_id_counterfactuals_map = {}
    const created_at_ms = 1627224381000
    const sim_ms = 1627224381000

    return <div>
        <WComponentForm
            wcomponent={wcomponent}
        />
    </div>

    // return <div>
    //     <EditableText
    //         placeholder={wcomponent.type === "action" ? "Passive imperative title..." : (wcomponent.type === "relation_link" ? "Verb..." : "Title...")}
    //         value={get_title({ rich_text: !editing, wcomponent, wcomponents_by_id, wc_id_counterfactuals_map, created_at_ms, sim_ms })}
    //         conditional_on_blur={title => {}}
    //         force_focus={true}
    //     />

    //     <WComponentFromTo
    //         connection_terminal_description="From"
    //         wcomponent_id={"wc33659374739333304"}
    //         connection_terminal_type={"meta"}
    //         on_update_id={from_id => {}}
    //         on_update_type={from_type => {}}
    //     />

    //     <WComponentFromTo
    //         connection_terminal_description="To"
    //         wcomponent_id={"wc33659374739333304"}
    //         connection_terminal_type={"meta"}
    //         on_update_id={to_id => {}}
    //         on_update_type={to_type => {}}
    //     />
    // </div>
}

export const SandBoxConnected = connector(_SandBoxConnected) as FunctionalComponent<{}>
