import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { MultiAutocompleteText } from "../form/Autocomplete/MultiAutocompleteText"
import { get_wcomponent_search_options } from "../search/get_wcomponent_search_options"
import type { HasObjectives, WComponentJudgement } from "../wcomponent/interfaces/judgement"
import {
    WComponent,
    wcomponent_is_judgement_or_objective,
} from "../wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../state/actions"
import {
    get_current_composed_knowledge_view_from_state,
    get_wcomponents_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { set_union } from "../utils/set"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"



interface OwnProps
{
    wcomponent: WComponent & HasObjectives
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
    force_editable?: boolean
}


const map_state = (state: RootState, { wcomponent }: OwnProps) =>
{
    const kv = get_current_composed_knowledge_view_from_state(state)
    const filtered_wcomponents: WComponentJudgement[] = []

    if (kv)
    {
        const { judgement, objective } = kv.wc_ids_by_type

        const ids = Array.from(set_union(judgement, objective))
        get_wcomponents_from_state(state, ids)
        .forEach((wc, index) =>
        {
            if (wcomponent_is_judgement_or_objective(wc, ids[index]!)) filtered_wcomponents.push(wc)
        })
    }


    const wc_id_to_counterfactuals_map = get_wc_id_to_counterfactuals_v2_map(state)


    return {
        consumption_formatting: state.display_options.consumption_formatting,
        filtered_wcomponents,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        wc_id_to_counterfactuals_map,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}



const map_dispatch = {
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
}



const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _ChosenObjectivesFormFields (props: Props)
{
    const { objective_ids = [] } = props.wcomponent
    if (props.consumption_formatting && objective_ids.length === 0) return null


    const wcomponent_id_options = get_wcomponent_search_options({
        wcomponents: props.filtered_wcomponents,
        wcomponents_by_id: props.wcomponents_by_id,
        wc_id_to_counterfactuals_map: props.wc_id_to_counterfactuals_map,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })

    return <div>
        <p>
            Objectives

            <MultiAutocompleteText
                force_editable={props.force_editable}
                placeholder="Objectives..."
                selected_option_ids={objective_ids}
                options={wcomponent_id_options}
                allow_none={true}
                on_change={objective_ids => props.upsert_wcomponent({ objective_ids })}
                on_mouse_over_option={id => props.set_highlighted_wcomponent({ id, highlighted: true })}
                on_mouse_leave_option={id => props.set_highlighted_wcomponent({ id, highlighted: false })}
            />
        </p>

        <hr />
        <br />
    </div>
}

export const ChosenObjectivesFormFields = connector(_ChosenObjectivesFormFields) as FunctionalComponent<OwnProps>
