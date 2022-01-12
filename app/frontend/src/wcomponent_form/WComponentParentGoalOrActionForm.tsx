import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import type { RootState } from "../state/State"
import type { WComponentNodeAction } from "../wcomponent/interfaces/action"
import { FormControl, FormLabel } from "@material-ui/core"
import { MultiAutocompleteText } from "../form/Autocomplete/MultiAutocompleteText"
import { get_wcomponent_search_options } from "../search/get_wcomponent_search_options"
import type { WComponentNodeGoal } from "../wcomponent/interfaces/goal"



interface OwnProps
{
    wcomponent: WComponentNodeGoal | WComponentNodeAction
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}


const map_state = (state: RootState) =>
{
    return {
        allowed_wcomponent_ids: state.derived.wcomponent_ids_by_type.goal_or_action,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        is_editing: !state.display_options.consumption_formatting,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentParentGoalOrActionForm (props: Props)
{
    const { wcomponent, upsert_wcomponent } = props


    const wcomponent_id_options = get_wcomponent_search_options({
        allowed_wcomponent_ids: props.allowed_wcomponent_ids,
        wcomponents_by_id: props.wcomponents_by_id,
        wc_id_to_counterfactuals_map: {},
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })


    return <FormControl component="fieldset" fullWidth={true} margin="normal">
        <FormLabel component="legend">Parent Goal (or Action)</FormLabel>
        <MultiAutocompleteText
            placeholder="Add Label"
            selected_option_ids={wcomponent.parent_goal_or_action_ids || []}
            options={wcomponent_id_options}
            allow_none={true}
            on_change={labels_ids =>
            {
                const new_parent_goal_or_action_ids = labels_ids.filter(id => !!id)
                upsert_wcomponent({
                    parent_goal_or_action_ids: new_parent_goal_or_action_ids
                })
            }}
            // on_mouse_over_option={id => props.set_highlighted_wcomponent({ id, highlighted: true })}
            // on_mouse_leave_option={id => props.set_highlighted_wcomponent({ id, highlighted: false })}
            // force_editable={props.force_editable}
        />
    </FormControl>
}

export const WComponentParentGoalOrActionForm = connector(_WComponentParentGoalOrActionForm) as FunctionalComponent<OwnProps>
