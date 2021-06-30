import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../../form/Autocomplete/AutocompleteText"
import { get_wcomponent_search_options } from "../../search/get_wcomponent_search_options"
import { is_defined } from "../../shared/utils/is_defined"
import type { WComponentCounterfactualV2 } from "../../shared/wcomponent/interfaces/counterfactual"
import { wcomponent_is_statev2 } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../state/actions"
import { get_current_composed_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"



interface OwnProps
{
    wcomponent: WComponentCounterfactualV2
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentCounterfactualV2>) => void
}


const map_state = (state: RootState) =>
{
    const kv = get_current_composed_knowledge_view_from_state(state)

    return {
        editing: !state.display_options.consumption_formatting,
        composed_wc_id_map: kv && kv.composed_wc_id_map,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}


const map_dispatch = {
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCounterfactualForm (props: Props)
{
    const {
        wcomponent,
        upsert_wcomponent,
        editing,
        wcomponents_by_id,
        composed_wc_id_map,
        // wcomponent_id,
        // wcomponents,
        // wcomponents_by_id,
    } = props

    if (!composed_wc_id_map) return <div>
        Counterfactual form can not render: No current knowledge view
    </div>


    const wcomponent_statev2s_in_current_kv = Object.keys(composed_wc_id_map)
        .map(id => wcomponents_by_id[id])
        .filter(is_defined)
        .filter(wcomponent_is_statev2)

    const wcomponent_id_options = get_wcomponent_search_options({
        wcomponents: wcomponent_statev2s_in_current_kv,
        wcomponents_by_id,
        wc_id_counterfactuals_map: {},
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })


    return <div>
        <p>
            {editing && <span className="description_label">Target component</span>}
            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    placeholder="Target component..."
                    allow_none={true}
                    selected_option_id={wcomponent.target_wcomponent_id}
                    options={wcomponent_id_options}
                    on_change={target_wcomponent_id => upsert_wcomponent({ target_wcomponent_id })}
                />
            </div>
        </p>
    </div>
}

export const WComponentCounterfactualForm = connector(_WComponentCounterfactualForm) as FunctionalComponent<OwnProps>
