import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { get_current_composed_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { get_wcomponent_search_options } from "./get_wcomponent_search_options"
import { SearchWindow } from "./SearchWindow"



interface OwnProps
{
    initial_search_term?: string
    on_change: (option_id: string | undefined) => void
    on_blur: () => void
}


const map_state = (state: RootState) => ({
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    wc_id_counterfactuals_map: get_current_composed_knowledge_view_from_state(state)?.wc_id_counterfactuals_map,
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentSearchWindow (props: Props)
{
    const options = get_wcomponent_search_options(props)

    return <SearchWindow
        search_window_title="Search for Component"
        placeholder="WComponent..."
        selected_option_id={""}
        initial_search_term={props.initial_search_term}
        allow_none={true}
        options={options}
        on_change={option_id => props.on_change(option_id)}
        on_blur={props.on_blur}
    />
}

export const WComponentSearchWindow = connector(_WComponentSearchWindow) as FunctionalComponent<OwnProps>
