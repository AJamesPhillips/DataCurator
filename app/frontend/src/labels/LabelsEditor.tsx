import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { MultiAutocompleteText } from "../form/Autocomplete/MultiAutocompleteText"
import { get_wcomponent_search_options } from "../search/get_wcomponent_search_options"
import { ACTIONS } from "../state/actions"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"
import type { RootState } from "../state/State"



interface OwnProps
{
    label_ids: string[] | undefined
    on_change: (new_label_ids: string[]) => void
    force_editable?: boolean
}



const map_state = (state: RootState, { }: OwnProps) =>
{
    return {
        ready: state.sync.ready_for_reading,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        wc_id_to_counterfactuals_map: get_wc_id_to_counterfactuals_v2_map(state),
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}



const map_dispatch = {
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
}



const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _LabelsEditor (props: Props)
{
    const { ready, label_ids = [] } = props

    if (!ready) return <div>Loading labels...</div>


    const wcomponent_id_options = get_wcomponent_search_options({
        wcomponents_by_id: props.wcomponents_by_id,
        wc_id_to_counterfactuals_map: props.wc_id_to_counterfactuals_map,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })

    return (
        <MultiAutocompleteText
            placeholder="Add Label"
            selected_option_ids={label_ids || []}
            options={wcomponent_id_options}
            allow_none={true}
            on_change={labels_ids =>
            {
                props.on_change(labels_ids.filter(id => !!id))
            }}
            on_mouse_over_option={id => props.set_highlighted_wcomponent({ id, highlighted: true })}
            on_mouse_leave_option={id => props.set_highlighted_wcomponent({ id, highlighted: false })}
            force_editable={props.force_editable}
        />
    )
}

export const LabelsEditor = connector(_LabelsEditor) as FunctionalComponent<OwnProps>
