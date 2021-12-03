import { FunctionComponent, h } from "preact"
import { useMemo } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { MultiAutocompleteText } from "../form/Autocomplete/MultiAutocompleteText"
import { get_wcomponent_search_options } from "../search/get_wcomponent_search_options"
import { Button } from "../sharedf/Button"
import { ACTIONS } from "../state/actions"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
({
    composed_kv: state.derived.current_composed_knowledge_view,
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    wc_id_to_counterfactuals_map: get_wc_id_to_counterfactuals_v2_map(state),
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
    selected_wcomponent_ids_list: state.meta_wcomponents.selected_wcomponent_ids_list,
    from_ids: state.meta_wcomponents.find_all_causal_paths_from_wcomponent_ids,
    to_ids: state.meta_wcomponents.find_all_causal_paths_to_wcomponent_ids,
})


const map_dispatch = {
    set_ids: ACTIONS.specialised_object.set_find_all_causal_paths_wcomponent_ids,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _FindAllCausalPaths (props: Props)
{
    const { composed_kv } = props

    const node_options = useMemo(() =>
    {
        const wc_ids_by_type = composed_kv?.wc_ids_by_type
        if (!wc_ids_by_type) return []

        return get_wcomponent_search_options({
            allowed_wcomponent_ids: wc_ids_by_type.any_node,
            wcomponents_by_id: props.wcomponents_by_id,
            wc_id_to_counterfactuals_map: props.wc_id_to_counterfactuals_map,
            created_at_ms: props.created_at_ms,
            sim_ms: props.sim_ms,
        })
    }, [composed_kv?.wc_ids_by_type])


    if (!composed_kv) return <div>Loading...</div>

    return <div>
        <Button
            value="Find all causal paths inbetween"
            fullWidth={true}
            disabled={true}
            onClick={() => {}}
        />

        From...
        <MultiAutocompleteText
            placeholder="From..."
            allow_none={true}
            selected_option_ids={props.from_ids}
            options={node_options}
            force_editable={true}
            on_change={new_from_ids => props.set_ids({ direction: "from", ids: new_from_ids })}
        />
        {props.selected_wcomponent_ids_list.length > 0 && <Button
            value="Use current selection"
            onClick={() => {
                props.set_ids({ direction: "from", ids: props.selected_wcomponent_ids_list })
            }}
        />}
        <br />

        To...
        <MultiAutocompleteText
            placeholder="To..."
            allow_none={true}
            selected_option_ids={props.to_ids}
            options={node_options}
            force_editable={true}
            on_change={new_to_ids => props.set_ids({ direction: "to", ids: new_to_ids })}
        />
        {props.selected_wcomponent_ids_list.length > 0 && <Button
            value="Use current selection"
            onClick={() => {
                props.set_ids({ direction: "to", ids: props.selected_wcomponent_ids_list })
            }}
        />}
    </div>
}

export const FindAllCausalPaths = connector(_FindAllCausalPaths) as FunctionComponent<{}>
