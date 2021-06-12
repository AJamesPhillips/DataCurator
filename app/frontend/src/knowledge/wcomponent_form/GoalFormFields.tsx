import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../../form/AutocompleteText"
import { get_wcomponent_search_options } from "../../search/get_wcomponent_search_options"
import type { WComponentNodeGoal } from "../../shared/wcomponent/interfaces/goal"
import type { WComponentJudgement } from "../../shared/wcomponent/interfaces/judgement"
import { WComponent, wcomponent_is_judgement_or_objective } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import { ACTIONS } from "../../state/actions"
import { get_current_UI_knowledge_view_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"



interface OwnProps
{
    wcomponent: WComponentNodeGoal
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}


const map_state = (state: RootState, { wcomponent }: OwnProps) =>
{
    const kv = get_current_UI_knowledge_view_from_state(state)
    const filtered_wcomponents: WComponentJudgement[] = []

    if (kv)
    {
        const { judgement, objective } = kv.wc_ids_by_type

        const ids = Array.from(judgement).concat(Array.from(objective))
        ids.forEach(id =>
        {
            const wc = state.specialised_objects.wcomponents_by_id[id]
            if (!wc)
            {
                console.error(`Unable to find wcomponent for id: "${id}"`)
                return
            }

            if (!wcomponent_is_judgement_or_objective(wc))
            {
                console.error(`wcomponent with id: "${id}" should be of type judgement or objective but is of type: "${wc.type}"`)
                return
            }

            filtered_wcomponents.push(wc)
        })
    }


    const wc_id_counterfactuals_map = get_current_UI_knowledge_view_from_state(state)?.wc_id_counterfactuals_map


    return {
        filtered_wcomponents,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        wc_id_counterfactuals_map,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}



const map_dispatch = {
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
}



const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _GoalFormFields (props: Props)
{
    const wcomponent_id_options = get_wcomponent_search_options({
        wcomponents: props.filtered_wcomponents,
        wcomponents_by_id: props.wcomponents_by_id,
        wc_id_counterfactuals_map: props.wc_id_counterfactuals_map,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })

    return <div>
        <p>
            Objectives

            <AutocompleteText
                placeholder="Objectives..."
                selected_option_id={""}
                options={wcomponent_id_options}
                allow_none={true}
                on_change={option_id => {}}
                on_mouse_over_option={id => props.set_highlighted_wcomponent({ id, highlighted: true })}
                on_mouse_leave_option={id => props.set_highlighted_wcomponent({ id, highlighted: false })}
            />
        </p>

        <hr />
        <br />
    </div>
}

export const GoalFormFields = connector(_GoalFormFields) as FunctionalComponent<OwnProps>
