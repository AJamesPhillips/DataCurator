import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { uncertain_date_to_string } from "../form/datetime_utils"
import { get_wcomponent_search_options } from "../search/get_wcomponent_search_options"
import { is_defined } from "../shared/utils/is_defined"
import { wcomponent_is_allowed_to_have_state_VAP_sets } from "../wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"
import { make_valid_selector, WComponentSubState, WComponentSubStateSelector } from "../wcomponent/interfaces/substate"
import { ExternalLinkIcon } from "../sharedf/icons/ExternalLinkIcon"
import { Link } from "../sharedf/Link"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import {
    convert_VAP_sets_to_visual_sub_state_value_possibilities,
    SimpleValuePossibilityWithSelected,
} from "../wcomponent_derived/sub_state/convert_VAP_sets_to_visual_sub_state_value_possibilities"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"
import {
    prune_items_by_created_at_and_versions_and_sort_by_datetimes,
} from "../wcomponent_derived/value_and_prediction/partition_and_prune_items_by_datetimes_and_versions"



interface OwnProps
{
    wcomponent: WComponentSubState
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentSubState>) => void
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { target_wcomponent_id } = own_props.wcomponent
    const maybe_target_wcomponent = state.specialised_objects.wcomponents_by_id[target_wcomponent_id || ""]
    const target_wcomponent = wcomponent_is_allowed_to_have_state_VAP_sets(maybe_target_wcomponent) && maybe_target_wcomponent
    // const knowledge_view = get_current_knowledge_view_from_state(state)

    return {
        // knowledge_view,
        // composed_wc_id_map: composed_kv && composed_kv.composed_wc_id_map,
        wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
        wcomponent_ids_with_state_VAPs: state.derived.wcomponent_ids_by_type.any_state_VAPs,
        created_at_ms: state.routing.args.created_at_ms,
        sim_ms: state.routing.args.sim_ms,
        editing: !state.display_options.consumption_formatting,
        target_wcomponent,
        wc_id_to_counterfactuals_map: get_wc_id_to_counterfactuals_v2_map(state),
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
        knowledge_views_by_id,
        wcomponent,
        upsert_wcomponent,
        target_wcomponent,
        wc_id_to_counterfactuals_map,
    } = props

    const wcomponents_with_state_VAP_sets = Array.from(props.wcomponent_ids_with_state_VAPs)
        .map(id => wcomponents_by_id[id])
        .filter(is_defined)
        .filter(wcomponent_is_allowed_to_have_state_VAP_sets)

    const wcomponent_id_options = get_wcomponent_search_options({
        wcomponents: wcomponents_with_state_VAP_sets,
        wcomponents_by_id,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })

    const selector: Partial<WComponentSubStateSelector> = wcomponent.selector || {}


    // Adapted from WComponentCounterfactualForm
    let target_VAP_sets: StateValueAndPredictionsSet[] = []
    let VAP_set_id_options: { id: string, title: string }[] = []
    let simple_possibilities: SimpleValuePossibilityWithSelected[] = []
    if (target_wcomponent)
    {
        target_VAP_sets = target_wcomponent.values_and_prediction_sets || []

        target_VAP_sets = prune_items_by_created_at_and_versions_and_sort_by_datetimes(target_VAP_sets, props.created_at_ms)

        VAP_set_id_options = target_VAP_sets
            .map(({ id, datetime }) =>
            {
                const title = uncertain_date_to_string(datetime, "minute")
                return { id, title }
            })

        simple_possibilities = convert_VAP_sets_to_visual_sub_state_value_possibilities({ selector: wcomponent.selector, target_wcomponent })
    }


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
                    // As of 2021-10-16 code base, a threshold_minimum_score of -10 works well for the different
                    // dates e.g. searching for "202" with 2021-01-01 and 2020-02-02 will score -7 for each, but
                    // searching for "2021" will score -11 and -6 respectively, thus removing 2021-01-01 from the
                    // list of options.  But not using as then other options are hidden when first clicked and
                    // focused on the element.
                    // threshold_minimum_score={-10}
                    retain_options_order={true}
                />
            </div>
        </p>}


        {target_wcomponent && <p>
            <span className="description_label">Select value possibility of interest to limit display by</span> &nbsp;

            <div>
                <input
                    type="radio"
                    disabled={!props.editing}
                    id="not_set_target_value"
                    checked={selector.target_value === undefined || selector.target_value_id_type === undefined}
                    onChange={() =>
                    {
                        const new_selector = make_valid_selector({
                            ...selector,
                            target_value: undefined,
                            target_value_id_type: undefined,
                        })

                        upsert_wcomponent({ selector: new_selector })
                    }}
                />
                <label for="not_set_target_value">Not set</label>
            </div>

            {simple_possibilities.map(value_possibility =>
            {
                const { value: value, id, selected } = value_possibility

                return <div>
                    <input
                        type="radio"
                        disabled={!props.editing}
                        id={id}
                        checked={selected || false}
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
