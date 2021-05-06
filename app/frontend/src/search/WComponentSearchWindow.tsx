import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { get_title } from "../shared/models/get_rich_text"

import { get_current_UI_knowledge_view_from_state } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { SearchWindow } from "./SearchWindow"



interface OwnProps
{
    on_change: (option_id: string | undefined) => void
    on_blur: () => void
}


const map_state = (state: RootState) => ({
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    wc_id_counterfactuals_map: get_current_UI_knowledge_view_from_state(state)?.wc_id_counterfactuals_map,
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentSearchWindow (props: Props)
{
    const { wcomponents_by_id, wc_id_counterfactuals_map: cf_map, created_at_ms, sim_ms } = props

    const options = Object.values(wcomponents_by_id)
        .map(wcomponent => {
            const counterfactuals = cf_map && cf_map[wcomponent.id]

            const title = get_title({
                wcomponent,
                rich_text: false,
                wcomponents_by_id,
                counterfactuals,
                created_at_ms,
                sim_ms,
            })

            return {
                id: wcomponent.id,
                title,
                subtitle: wcomponent.title,
            }
        })

    return <SearchWindow
        search_window_title="Search for Component"
        placeholder="WComponent..."
        selected_option_id={""}
        allow_none={true}
        options={options}
        on_change={option_id => props.on_change(option_id)}
        on_blur={props.on_blur}
    />
}

export const WComponentSearchWindow = connector(_WComponentSearchWindow) as FunctionalComponent<OwnProps>
