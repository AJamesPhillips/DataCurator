import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../../form/Autocomplete/AutocompleteText"
import { uncertain_date_to_string } from "../../form/datetime_utils"
import { EditableCheckbox } from "../../form/EditableCheckbox"
import { get_wcomponent_search_options } from "../../search/get_wcomponent_search_options"
import { clean_VAP_set_for_counterfactual } from "../../shared/counterfactuals/clean_VAP_set"
import { get_VAP_visuals_data, VAP_visual_id__undefined } from "../../shared/counterfactuals/convert_VAP_sets_to_visual_VAP_sets"
import { is_defined } from "../../shared/utils/is_defined"
import type { WComponentCounterfactualV2 } from "../../shared/wcomponent/interfaces/counterfactual"
import { wcomponent_is_statev2 } from "../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet } from "../../shared/wcomponent/interfaces/state"
import { wcomponent_VAPs_represent } from "../../shared/wcomponent/value_and_prediction/utils"
import { ACTIONS } from "../../state/actions"
import {
    get_current_composed_knowledge_view_from_state,
    get_current_knowledge_view_from_state,
} from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { toggle_item_in_list } from "../../utils/list"



interface OwnProps
{
    wcomponent: WComponentCounterfactualV2
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentCounterfactualV2>) => void
}


const map_state = (state: RootState) =>
{
    const knowledge_view = get_current_knowledge_view_from_state(state)
    const composed_kv = get_current_composed_knowledge_view_from_state(state)

    return {
        knowledge_view,
        editing: !state.display_options.consumption_formatting,
        composed_wc_id_map: composed_kv && composed_kv.composed_wc_id_map,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
    }
}


const map_dispatch = {
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCounterfactualForm (props: Props)
{
    const {
        wcomponent,
        upsert_wcomponent,
        wcomponents_by_id,
        composed_wc_id_map,
        knowledge_view,
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


    const target_wcomponent = wcomponents_by_id[wcomponent.target_wcomponent_id || ""]
    let target_VAP_sets: StateValueAndPredictionsSet[] = []
    let VAP_set_id_options: { id: string, title: string }[] = []
    if (wcomponent_is_statev2(target_wcomponent))
    {
        target_VAP_sets = target_wcomponent.values_and_prediction_sets || []

        VAP_set_id_options = target_VAP_sets
            .map(({ id, datetime }) =>
            {
                const title = uncertain_date_to_string(datetime, "minute")
                return { id, title }
            })
    }


    const counterfactual_VAP_set = wcomponent.counterfactual_VAP_set
    const VAPs_represent = wcomponent_VAPs_represent(target_wcomponent)


    let counterfactual_active_for_current_knowledge_view = false
    if (knowledge_view)
    {
        const ids = (knowledge_view.active_counterfactual_v2_ids || [])
        counterfactual_active_for_current_knowledge_view = ids.includes(wcomponent.id)
    }


    return <div>
        <p>
            <span className="description_label">Target component</span> &nbsp;
            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    allow_none={true}
                    selected_option_id={wcomponent.target_wcomponent_id}
                    options={wcomponent_id_options}
                    on_change={target_wcomponent_id => upsert_wcomponent({
                        target_wcomponent_id,
                        target_VAP_set_id: undefined,
                        counterfactual_VAP_set: undefined,
                    })}
                    on_mouse_over_option={id => props.set_highlighted_wcomponent({ id, highlighted: true })}
                    on_mouse_leave_option={id => props.set_highlighted_wcomponent({ id, highlighted: false })}
                />
            </div>
        </p>


        {wcomponent.target_wcomponent_id && <p>
            <span className="description_label">Target value set to override</span> &nbsp;
            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    allow_none={true}
                    selected_option_id={wcomponent.target_VAP_set_id}
                    options={VAP_set_id_options}
                    on_change={new_target_VAP_set_id =>
                    {
                        const target_VAP_set = target_VAP_sets.find(({ id }) => id === new_target_VAP_set_id)

                        const VAP_set: StateValueAndPredictionsSet | undefined = target_VAP_set
                            ? clean_VAP_set_for_counterfactual(target_VAP_set)
                            : undefined

                        upsert_wcomponent({
                            target_VAP_set_id: new_target_VAP_set_id,
                            counterfactual_VAP_set: VAP_set,
                        })
                    }}
                />
            </div>
        </p>}


        {counterfactual_VAP_set && target_wcomponent && <p>
            <span className="description_label">Counterfactual value</span> &nbsp;
            {get_VAP_visuals_data({
                VAP_set: counterfactual_VAP_set,
                VAPs_represent,
                wcomponent: target_wcomponent,
                sort: false,
            }).map(visual_VAP =>
            {
                const { id, value_text, certainty } = visual_VAP
                const checked = certainty === 1

                return <div>
                    <input
                        type="radio"
                        id={id}
                        name="counterfactual_vap"
                        value={value_text}
                        checked={checked}
                        onChange={() =>
                        {
                            const new_entries = counterfactual_VAP_set.entries
                                .map(entry => ({ ...entry, probability: entry.id === id ? 1 : 0 }))

                            const shared_entry_values = {
                                ...counterfactual_VAP_set.shared_entry_values,
                                conviction: id === VAP_visual_id__undefined ? 0 : 1,
                            }

                            const new_counterfactual_VAP_set = {
                                ...counterfactual_VAP_set,
                                entries: new_entries,
                                shared_entry_values,
                            }

                            upsert_wcomponent({ counterfactual_VAP_set: new_counterfactual_VAP_set })
                        }}
                    />
                    <label for={id}>{value_text}</label>
                </div>
            })}
        </p>}


        {counterfactual_VAP_set && knowledge_view && <p>
            <span className="description_label">Counterfactual activity on this knowledge view</span> &nbsp;
            <EditableCheckbox
                value={counterfactual_active_for_current_knowledge_view}
                on_change={() => {
                    const { id } = wcomponent
                    const active_counterfactual_v2_ids = toggle_item_in_list(knowledge_view.active_counterfactual_v2_ids || [], id)

                    const kv = {
                        ...knowledge_view,
                        active_counterfactual_v2_ids,
                    }
                    props.upsert_knowledge_view({ knowledge_view: kv })
                }}
            />
        </p>}
    </div>
}

export const WComponentCounterfactualForm = connector(_WComponentCounterfactualForm) as FunctionalComponent<OwnProps>
