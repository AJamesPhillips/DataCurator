import { describe, test } from "../../../shared/utils/test"
import { prepare_new_VAP } from "../../../wcomponent/CRUD_helpers/prepare_new_VAP"
import { prepare_new_VAP_set } from "../../../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { prepare_new_wcomponent_object } from "../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentsById } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { VAPsType } from "../../../wcomponent/interfaces/VAPsType"
import { StateValueAndPrediction, WComponentNodeStateV2 } from "../../../wcomponent/interfaces/state"
import { CreationContextState } from "../../creation_context/state"
import { tidy_wcomponent } from "./tidy_wcomponent"



export const test_tidy_wcomponent = describe.delay("tidy_wcomponent", () =>
{
    const sort_list = false

    const dt1 = new Date("2021-05-12")
    const dt2 = new Date("2021-05-13")

    const creation_context: CreationContextState = { use_creation_context: false, creation_context: {
        label_ids: [],
    } }

    let wcomponent: WComponentNodeStateV2
    let VAPs: StateValueAndPrediction[]
    let tidied: WComponentNodeStateV2
    let tidied_VAPs: StateValueAndPrediction[]
    let wcomponents_by_id: WComponentsById = {}

    const base_id = -1

    // Should sort VAP sets by ascending created_at
    wcomponent = prepare_new_wcomponent_object({ base_id, type: "statev2", subtype: "other" }, creation_context) as WComponentNodeStateV2
    wcomponent.values_and_prediction_sets = [
        { ...prepare_new_VAP_set(VAPsType.undefined, {}, [], base_id, creation_context), id: "vps2", created_at: dt2, custom_created_at: undefined },
        { ...prepare_new_VAP_set(VAPsType.undefined, {}, [], base_id, creation_context), id: "vps1", created_at: dt1, custom_created_at: undefined },
    ]
    tidied = tidy_wcomponent(wcomponent, wcomponents_by_id) as WComponentNodeStateV2

    test(tidied.values_and_prediction_sets!.map(({ id }) => id), ["vps1", "vps2"], "", sort_list)



    wcomponent = prepare_new_wcomponent_object({ base_id, type: "statev2", subtype: "other" }, creation_context) as WComponentNodeStateV2
    VAPs = [
        { ...prepare_new_VAP(), id: "VAP1", relative_probability: 5 },
        { ...prepare_new_VAP(), id: "VAP2", relative_probability: 0 },
    ]
    wcomponent.values_and_prediction_sets = [
        { ...prepare_new_VAP_set(VAPsType.undefined, {}, [], base_id, creation_context), entries: VAPs },
    ]
    tidied = tidy_wcomponent(wcomponent, wcomponents_by_id) as WComponentNodeStateV2

    test(tidied.values_and_prediction_sets![0]!.entries.map(({ probability }) => probability), [1, 0], "", sort_list)



    // Changing wcomponent to type boolean should not result in relative_probability being removed
    // Changing wcomponent to type boolean should allow probabilites to be different from relative_probability
    wcomponent = { ...wcomponent, subtype: "boolean" }
    tidied = tidy_wcomponent(wcomponent, wcomponents_by_id) as WComponentNodeStateV2
    tidied_VAPs = tidied.values_and_prediction_sets![0]!.entries
    test(tidied_VAPs.map(({ relative_probability: rp }) => rp), [5, 0], "", sort_list)
    test(tidied_VAPs.map(({ probability }) => probability), [1, 0], "", sort_list)


    VAPs = [
        { ...prepare_new_VAP(), id: "VAP1", relative_probability: 5, probability: 0 },
        { ...prepare_new_VAP(), id: "VAP2", relative_probability: 0, probability: 1 },
    ]
    let values_and_prediction_sets = [
        { ...prepare_new_VAP_set(VAPsType.undefined, {}, [], base_id, creation_context), entries: VAPs },
    ]
    wcomponent = { ...wcomponent, subtype: "boolean", values_and_prediction_sets }

    tidied = tidy_wcomponent(wcomponent, wcomponents_by_id) as WComponentNodeStateV2
    tidied_VAPs = tidied.values_and_prediction_sets![0]!.entries

    test(tidied_VAPs.map(({ relative_probability: rp }) => rp), [5, 0], "", sort_list)
    test(tidied_VAPs.map(({ probability }) => probability), [0, 1], "", sort_list)


    describe("Ensuring _derived__using_value_from_wcomponent_id is not saved", () =>
    {
        const original_console_error_function = console.error
        let error_message = ""
        console.error = (message: string) =>
        {
            error_message = message
            // original_console_error_function(message)
        }

        wcomponent = { ...wcomponent, _derived__using_value_from_wcomponent_id: "123" }
        tidied = tidy_wcomponent(wcomponent, wcomponents_by_id) as WComponentNodeStateV2
        console.error = original_console_error_function

        test(error_message.length > 0, true, "Should log an error to the console when wcomponent with _derived__using_value_from_wcomponent_id is tidied before attempting to be saved")
        test(tidied._derived__using_value_from_wcomponent_id, undefined, "Should delete wcomponent._derived__using_value_from_wcomponent_id")
    })

})
