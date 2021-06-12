import type { AnyAction } from "redux"

import { prepare_new_VAP, prepare_new_VAP_set, set_VAP_probabilities } from "../../../knowledge/multiple_values/utils"
import { get_new_wcomponent_object } from "../../../shared/wcomponent/get_new_wcomponent_object"
import {
    WComponent,
    wcomponent_has_validity_predictions,
    wcomponent_is_statev1,
    wcomponent_is_statev2,
} from "../../../shared/wcomponent/interfaces/SpecialisedObjects"
import type { StateValueAndPrediction, WComponentNodeStateV2 } from "../../../shared/wcomponent/interfaces/state"
import { get_created_at_ms } from "../../../shared/wcomponent/utils_datetime"
import { sort_list } from "../../../shared/utils/sort"
import { test } from "../../../shared/utils/test"
import { update_substate, update_subsubstate } from "../../../utils/update_state"
import type { RootState } from "../../State"
import { is_upsert_wcomponent, is_delete_wcomponent } from "./actions"
import type { CreationContextState } from "../../../shared/creation_context/state"
import { subtype_to_VAPsRepresent } from "../../../shared/wcomponent/value_and_prediction/utils"
// Commenting out because this is an (as yet) UNJUSTIFIED OPTIMISATION
// import {
//     update_wcomponent_ids_by_type_on_upserting_wcomponent,
//     update_wcomponent_ids_by_type_on_deleting_wcomponent,
// } from "../../derived/update_wcomponent_ids_by_type"



export const wcomponents_reducer = (state: RootState, action: AnyAction): RootState =>
{

    if (is_upsert_wcomponent(action))
    {
        const wcomponent = tidy_wcomponent(action.wcomponent)
        const wcomponent_id = wcomponent.id


        state = update_subsubstate(state, "specialised_objects", "wcomponents_by_id", wcomponent_id, wcomponent)
        // Commenting out because this is an (as yet) UNJUSTIFIED OPTIMISATION
        // state = update_wcomponent_ids_by_type_on_upserting_wcomponent(state, wcomponent)
    }


    if (is_delete_wcomponent(action))
    {
        const { wcomponent_id } = action
        const map = { ...state.specialised_objects.wcomponents_by_id }
        const existing = map[wcomponent_id]


        if (existing)
        {
            delete map[wcomponent_id]
            state = update_substate(state, "specialised_objects", "wcomponents_by_id", map)

            // Commenting out because this is an (as yet) UNJUSTIFIED OPTIMISATION
            // state = update_wcomponent_ids_by_type_on_deleting_wcomponent(state, existing)
        }
    }

    return state
}



function tidy_wcomponent (wcomponent: WComponent): WComponent
{
    if (wcomponent_has_validity_predictions(wcomponent))
    {
        const sorted_predictions = sort_list(wcomponent.validity, get_created_at_ms, "ascending")
        wcomponent.validity = sorted_predictions
    }

    if (wcomponent_is_statev1(wcomponent))
    {
        const sorted_values = sort_list(wcomponent.values || [], get_created_at_ms, "ascending")
        wcomponent.values = sorted_values
    }

    if (wcomponent_is_statev2(wcomponent))
    {
        const sorted_VAP_sets = sort_list(wcomponent.values_and_prediction_sets || [], get_created_at_ms, "ascending")

        const VAPs_represent = subtype_to_VAPsRepresent(wcomponent.subtype)

        const corrected_VAPs_in_VAP_sets = sorted_VAP_sets.map(VAP_set => ({
            ...VAP_set,
            entries: set_VAP_probabilities(VAP_set.entries, VAPs_represent),
        }))

        wcomponent.values_and_prediction_sets = corrected_VAPs_in_VAP_sets
    }

    return wcomponent
}



function run_tests ()
{
    console .log("running tests of tidy_wcomponent")

    const sort_list = false

    const dt1 = new Date("2021-05-12")
    const dt2 = new Date("2021-05-13")

    const creation_context: CreationContextState = { use_creation_context: false, creation_context: {} }

    let wcomponent: WComponentNodeStateV2
    let VAPs: StateValueAndPrediction[]
    let tidied: WComponentNodeStateV2
    let tidied_VAPs: StateValueAndPrediction[]

    // Should sort VAP sets by ascending created_at
    wcomponent = get_new_wcomponent_object({ type: "statev2", subtype: "other" }, creation_context) as WComponentNodeStateV2
    wcomponent.values_and_prediction_sets = [
        { ...prepare_new_VAP_set(creation_context), id: "vps2", created_at: dt2, custom_created_at: undefined },
        { ...prepare_new_VAP_set(creation_context), id: "vps1", created_at: dt1, custom_created_at: undefined },
    ]
    tidied = tidy_wcomponent(wcomponent) as WComponentNodeStateV2

    test(tidied.values_and_prediction_sets!.map(({ id }) => id), ["vps1", "vps2"], sort_list)



    wcomponent = get_new_wcomponent_object({ type: "statev2", subtype: "other" }, creation_context) as WComponentNodeStateV2
    VAPs = [
        { ...prepare_new_VAP(), id: "VAP1", relative_probability: 5 },
        { ...prepare_new_VAP(), id: "VAP2", relative_probability: 0 },
    ]
    wcomponent.values_and_prediction_sets = [
        { ...prepare_new_VAP_set(creation_context), entries: VAPs },
    ]
    tidied = tidy_wcomponent(wcomponent) as WComponentNodeStateV2

    test(tidied.values_and_prediction_sets![0]!.entries.map(({ probability }) => probability), [1, 0], sort_list)



    // Changing wcomponent to type boolean should not result in relative_probability being removed
    // Changing wcomponent to type boolean should allow probabilites to be different from relative_probability
    wcomponent = { ...wcomponent, subtype: "boolean" }
    tidied = tidy_wcomponent(wcomponent) as WComponentNodeStateV2
    tidied_VAPs = tidied.values_and_prediction_sets![0]!.entries
    test(tidied_VAPs.map(({ relative_probability: rp }) => rp), [5, 0], sort_list)
    test(tidied_VAPs.map(({ probability }) => probability), [1, 0], sort_list)


    VAPs = [
        { ...prepare_new_VAP(), id: "VAP1", relative_probability: 5, probability: 0 },
        { ...prepare_new_VAP(), id: "VAP2", relative_probability: 0, probability: 1 },
    ]
    let values_and_prediction_sets = [
        { ...prepare_new_VAP_set(creation_context), entries: VAPs },
    ]
    wcomponent = { ...wcomponent, subtype: "boolean", values_and_prediction_sets }

    tidied = tidy_wcomponent(wcomponent) as WComponentNodeStateV2
    tidied_VAPs = tidied.values_and_prediction_sets![0]!.entries

    test(tidied_VAPs.map(({ relative_probability: rp }) => rp), [5, 0], sort_list)
    test(tidied_VAPs.map(({ probability }) => probability), [0, 1], sort_list)
}

// run_tests()
