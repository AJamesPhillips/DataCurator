import { describe, test } from "datacurator-core/utils/test"
import { prepare_new_VAP_set } from "../../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { prepare_new_contextless_wcomponent_object } from "../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { wcomponent_is_statev2 } from "../../wcomponent/interfaces/SpecialisedObjects"
import { VAPsType } from "../../wcomponent/interfaces/VAPsType"
import { get_composed_wcomponents_by_id } from "./get_composed_wcomponents_by_id"


export const test_get_composed_wcomponents_by_id = describe.delay("get_composed_wcomponents_by_id", () =>
{
    const base_id = -1
    const dt1 = new Date("2024-10-08")

    const vap_set_1 = prepare_new_VAP_set(VAPsType.number, {"1": {id: "1", order: 1, value: "10", description: ""} }, [], base_id)
    vap_set_1.created_at = dt1
    const wcomponent_statev2 = prepare_new_contextless_wcomponent_object({
        type: "statev2",
        base_id,
        values_and_prediction_sets: [vap_set_1],
    })
    wcomponent_statev2.created_at = dt1

    const vap_set_2 = prepare_new_VAP_set(VAPsType.number, {"2": {id: "2", order: 1, value: "20", description: ""} }, [], base_id)
    vap_set_2.created_at = dt1
    const wcomponent_state_value = prepare_new_contextless_wcomponent_object({
        type: "state_value",
        base_id,
        values_and_prediction_sets: [vap_set_2],
        attribute_wcomponent_id: wcomponent_statev2.id,
    })
    wcomponent_state_value.created_at = dt1

    const composed_wcomponents_by_id = get_composed_wcomponents_by_id({
        wcomponents_by_id: {
            [wcomponent_statev2.id]: wcomponent_statev2,
            [wcomponent_state_value.id]: wcomponent_state_value,
        },
        composed_visible_wc_id_map: {
            [wcomponent_statev2.id]: { left: 0, top: 0 },
            [wcomponent_state_value.id]: { left: 0, top: 0 },
        },
        created_at_ms: dt1.getTime(),
    })


    const composed_wcomponent_statev2 = composed_wcomponents_by_id[wcomponent_statev2.id]
    // Type guard
    if (!wcomponent_is_statev2(composed_wcomponent_statev2))
    {
        throw new Error(`Expected composed wcomponent to be statev2`)
    }
    test(composed_wcomponent_statev2._derived__using_value_from_wcomponent_id, wcomponent_state_value.id, "should populate the _derived__using_value_from_wcomponent_id field of the statev2 with the id of the state_value component that is targeting it.")

    const composed_vap_set_1 = (composed_wcomponent_statev2.values_and_prediction_sets || [])[0]
    test(composed_vap_set_1?.entries[0]?.value, "20", "should replace the VAP set of a statev2 with the VAP set of the state_value component that is targeting it.")
})
