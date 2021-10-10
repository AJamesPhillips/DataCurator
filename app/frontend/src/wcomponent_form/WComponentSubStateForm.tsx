import Warning from "@material-ui/icons/Warning"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { uncertain_date_to_string } from "../form/datetime_utils"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { get_wcomponent_search_options } from "../search/get_wcomponent_search_options"
import {
    get_VAP_visuals_data,
} from "../wcomponent/value_and_prediction/convert_VAP_sets_to_visual_VAP_sets"
import { is_defined } from "../shared/utils/is_defined"
import type {
    StateValueAndPredictionsSet as VAPSet,
} from "../wcomponent/interfaces/state"
import { wcomponent_is_statev2 } from "../wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"
import { make_valid_selector, WComponentSubState, WComponentSubStateSelector } from "../wcomponent/interfaces/substate"
import { get_wcomponent_VAPs_represent } from "../wcomponent/value_and_prediction/utils"
import { ExternalLinkIcon } from "../sharedf/icons/ExternalLinkIcon"
import { Link } from "../sharedf/Link"
import { ACTIONS } from "../state/actions"
import {
    get_current_composed_knowledge_view_from_state,
    get_current_knowledge_view_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { toggle_item_in_list } from "../utils/list"
import { get_simple_possibilities_from_VAP_sets } from "../knowledge/multiple_values/value_possibilities/get_possibilities_from_VAP_sets"
import type { SimpleValuePossibility } from "../wcomponent/interfaces/possibility"
import {
    get_sub_state_value_possibilities,
    SimpleValuePossibilityWithSelected,
} from "../knowledge/multiple_values/sub_state/get_sub_state_value_possibilities"



interface OwnProps
{
    wcomponent: WComponentSubState
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentSubState>) => void
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { target_wcomponent_id } = own_props.wcomponent
    const maybe_target_wcomponent = state.specialised_objects.wcomponents_by_id[target_wcomponent_id || ""]
    const target_wcomponent = wcomponent_is_statev2(maybe_target_wcomponent) && maybe_target_wcomponent
    // const knowledge_view = get_current_knowledge_view_from_state(state)
    // const composed_kv = get_current_composed_knowledge_view_from_state(state)


    return {
        // knowledge_view,
        // composed_wc_id_map: composed_kv && composed_kv.composed_wc_id_map,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        statev2_wcomponent_ids: state.derived.wcomponent_ids_by_type.statev2,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        editing: !state.display_options.consumption_formatting,
        target_wcomponent,
    }
}


const map_dispatch = {
    set_highlighted_wcomponent: ACTIONS.specialised_object.set_highlighted_wcomponent,
    upsert_knowledge_view: ACTIONS.specialised_object.upsert_knowledge_view,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentSubStateForm (props: Props)
{
    const {
        wcomponents_by_id,
        wcomponent,
        upsert_wcomponent,
        target_wcomponent,
    } = props

    const wcomponent_statev2s = Array.from(props.statev2_wcomponent_ids)
        .map(id => wcomponents_by_id[id])
        .filter(is_defined)
        .filter(wcomponent_is_statev2)

    const wcomponent_id_options = get_wcomponent_search_options({
        wcomponents: wcomponent_statev2s,
        wcomponents_by_id,
        wc_id_counterfactuals_map: {},
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })


    // Copied from WComponentCounterfactualForm
    let target_VAP_sets: StateValueAndPredictionsSet[] = []
    let VAP_set_id_options: { id: string, title: string }[] = []
    let simple_possibilities: SimpleValuePossibilityWithSelected[] = []
    if (target_wcomponent)
    {
        target_VAP_sets = target_wcomponent.values_and_prediction_sets || []

        VAP_set_id_options = target_VAP_sets
            .map(({ id, datetime }) =>
            {
                const title = uncertain_date_to_string(datetime, "minute")
                return { id, title }
            })

        simple_possibilities = get_sub_state_value_possibilities(wcomponent, target_wcomponent)
    }


    const selector: Partial<WComponentSubStateSelector> = wcomponent.selector || {}
    // const VAPs_represent = wcomponent_VAPs_represent(target_wcomponent)

    const target_VAP_set = target_VAP_sets.find(({ id }) => id === selector.target_VAP_set_id)



    // let counterfactual_active_for_current_knowledge_view = false
    // if (knowledge_view)
    // {
    //     const ids = (knowledge_view.active_counterfactual_v2_ids || [])
    //     counterfactual_active_for_current_knowledge_view = ids.includes(wcomponent.id)
    // }



    return <div>
        <p>
            <span className="description_label">Target component</span> &nbsp;

            {wcomponent.target_wcomponent_id && <Link
                route={undefined}
                sub_route={undefined}
                item_id={wcomponent.target_wcomponent_id}
                args={undefined}
            ><ExternalLinkIcon /> &nbsp;</Link>}

            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    allow_none={true}
                    selected_option_id={wcomponent.target_wcomponent_id}
                    options={wcomponent_id_options}
                    on_change={target_wcomponent_id => upsert_wcomponent({
                        target_wcomponent_id,
                        selector: undefined,
                    })}
                    on_mouse_over_option={id => props.set_highlighted_wcomponent({ id, highlighted: true })}
                    on_mouse_leave_option={id => props.set_highlighted_wcomponent({ id, highlighted: false })}
                />
            </div>
        </p>


        {target_wcomponent && <p>
            <span className="description_label">Select value and prediction set timepoint of interest to display</span> &nbsp;
            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    allow_none={true}
                    selected_option_id={selector.target_VAP_set_id}
                    options={VAP_set_id_options}
                    on_change={new_target_VAP_set_id =>
                    {
                        const new_selector = make_valid_selector({
                            ...selector,
                            target_VAP_set_id: new_target_VAP_set_id,
                        })

                        upsert_wcomponent({ selector: new_selector })
                    }}
                />
            </div>
        </p>}


        {target_wcomponent && <p>
            <span className="description_label">Select value possibility of interest to limit display by</span> &nbsp;
            {simple_possibilities.map(value_possibility =>
            {
                const { value, id, selected } = value_possibility

                return <div>
                    <input
                        type="radio"
                        disabled={!props.editing}
                        id={id}
                        name="counterfactual_vap"
                        value={value}
                        checked={selected}
                        ref={el => el && (el.indeterminate = selected === undefined)}
                        onChange={() =>
                        {
                            const new_selector = make_valid_selector({
                                ...selector,
                                target_value: id || value,
                                target_value_id_type: id ? "id" : "value_string",
                            })

                            upsert_wcomponent({ selector: new_selector })
                        }}
                    />
                    <label for={id}>{value}</label>
                </div>
            })}
        </p>}


        {/* {knowledge_view && <p>
            <span className="description_label">Apply counterfactual in this knowledge view</span> &nbsp;
            <EditableCheckbox
                // disabled={!props.editing}
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
            {!counterfactual_VAP_set && counterfactual_active_for_current_knowledge_view && <span title="Will not be applied yet, you need to target a component and one of its value sets"><Warning /></span>}
        </p>} */}
    </div>
}

export const WComponentSubStateForm = connector(_WComponentSubStateForm) as FunctionalComponent<OwnProps>
