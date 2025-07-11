import Warning from "@mui/icons-material/Warning"
import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { uncertain_date_to_string } from "datacurator-core/utils/datetime"

import { AutocompleteText } from "../form/Autocomplete/AutocompleteText"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { get_wcomponent_search_options } from "../search/get_wcomponent_search_options"
import { is_defined } from "../shared/utils/is_defined"
import { ExternalLinkIcon } from "../sharedf/icons/ExternalLinkIcon"
import { Link } from "../sharedf/Link"
import { ACTIONS } from "../state/actions"
import {
    get_current_composed_knowledge_view_from_state,
    get_current_knowledge_view_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { toggle_item_in_list } from "../utils/list"
import { get_wcomponent_VAPs_represent } from "../wcomponent/get_wcomponent_VAPs_represent"
import type {
    WComponentCounterfactualV2,
} from "../wcomponent/interfaces/counterfactual"
import { wcomponent_is_allowed_to_have_state_VAP_sets } from "../wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"
import {
    convert_VAP_set_to_VAP_visuals,
} from "../wcomponent_derived/value_and_prediction/convert_VAP_set_to_VAP_visuals"



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
        knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
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
        knowledge_views_by_id,
        composed_wc_id_map,
        knowledge_view,
    } = props

    if (!composed_wc_id_map) return <div>
        Counterfactual form can not render: No current knowledge view
    </div>


    const wcomponent_statev2s_in_current_kv = Object.keys(composed_wc_id_map)
        .map(id => wcomponents_by_id[id])
        .filter(is_defined)
        .filter(wcomponent_is_allowed_to_have_state_VAP_sets)

    const wcomponent_id_options = get_wcomponent_search_options({
        wcomponents: wcomponent_statev2s_in_current_kv,
        wcomponents_by_id,
        knowledge_views_by_id,
        wc_id_to_counterfactuals_map: undefined,
        created_at_ms: props.created_at_ms,
        sim_ms: props.sim_ms,
    })


    const target_wcomponent = wcomponents_by_id[wcomponent.target_wcomponent_id || ""]
    let target_VAP_sets: StateValueAndPredictionsSet[] = []
    let VAP_set_id_options: { id: string, title: string }[] = []
    if (wcomponent_is_allowed_to_have_state_VAP_sets(target_wcomponent))
    {
        target_VAP_sets = target_wcomponent.values_and_prediction_sets || []

        VAP_set_id_options = target_VAP_sets
            .map(({ id, datetime }) =>
            {
                const title = uncertain_date_to_string(datetime)
                return { id, title }
            })
    }


    const VAPs_represent = get_wcomponent_VAPs_represent(target_wcomponent, wcomponents_by_id)
    const target_VAP_set = target_VAP_sets.find(({ id }) => id === wcomponent.target_VAP_set_id)


    let counterfactual_active_for_current_knowledge_view = false
    if (knowledge_view)
    {
        const ids = (knowledge_view.active_counterfactual_v2_ids || [])
        counterfactual_active_for_current_knowledge_view = ids.includes(wcomponent.id)
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
                        target_VAP_set_id: undefined,
                        target_VAP_id: undefined,
                    })}
                    on_mouse_over_option={id => props.set_highlighted_wcomponent({ id, highlighted: true })}
                    on_mouse_leave_option={id => props.set_highlighted_wcomponent({ id, highlighted: false })}
                />
            </div>
        </p>


        {wcomponent.target_wcomponent_id && <p>
            <span className="description_label">Target value and prediction set to override</span> &nbsp;
            <div style={{ width: "60%", display: "inline-block" }}>
                <AutocompleteText
                    allow_none={true}
                    selected_option_id={wcomponent.target_VAP_set_id}
                    options={VAP_set_id_options}
                    on_change={new_target_VAP_set_id =>
                    {
                        upsert_wcomponent({
                            target_VAP_set_id: new_target_VAP_set_id,
                            target_VAP_id: undefined,
                        })
                    }}
                />
            </div>
        </p>}


        {target_wcomponent && target_VAP_set && <p>
            <span className="description_label">Counterfactual value</span> &nbsp;
            {convert_VAP_set_to_VAP_visuals({
                VAP_set: target_VAP_set,
                VAPs_represent,
                wcomponent: target_wcomponent,
            }).map(visual_VAP =>
            {
                const { VAP_id, value_text } = visual_VAP
                const checked = VAP_id === wcomponent.target_VAP_id

                return <div>
                    <input
                        type="radio"
                        disabled={!props.editing}
                        id={VAP_id}
                        value={value_text}
                        checked={checked}
                        onChange={() => upsert_wcomponent({ target_VAP_id: VAP_id })}
                    />
                    <label for={VAP_id}>{value_text}</label>
                </div>
            })}
        </p>}


        {knowledge_view && <p>
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
            {!target_VAP_set && counterfactual_active_for_current_knowledge_view && <span title="Will not be applied yet, you need to target a component and one of its value sets"><Warning /></span>}
        </p>}
    </div>
}

export const WComponentCounterfactualForm = connector(_WComponentCounterfactualForm) as FunctionalComponent<OwnProps>
