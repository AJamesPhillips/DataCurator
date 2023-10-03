import { describe, test } from "../shared/utils/test"
import { uuid_v4_for_tests } from "../utils/uuid_v4_for_tests"
import { prepare_new_contextless_wcomponent_object } from "../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentsById } from "../wcomponent/interfaces/SpecialisedObjects"
import { apply_units_from_component } from "./apply_units_from_component"



export const run_apply_units_from_component_tests = describe("apply_units_from_component", () =>
{
    let units: string
    let calculation_string: string
    let wcomponents_by_id: WComponentsById
    let prepared_units: string | undefined
    let expected_prepared_units: string

    const id1 = uuid_v4_for_tests(1)
    const id2 = uuid_v4_for_tests(2)
    const base_id = 0


    const wcomponent_1 = prepare_new_contextless_wcomponent_object({
        base_id,
        id: id1,
        title: "Some state component",
        type: "statev2",
        units: "seconds",
    })
    wcomponents_by_id = {
        [id1]: wcomponent_1,
    }



    calculation_string = `@@${id1}`
    units = ""
    expected_prepared_units = "seconds"
    prepared_units = apply_units_from_component(calculation_string, units, wcomponents_by_id)
    test(prepared_units, expected_prepared_units, "Can access a wcomponent's value and uses its units when no units given by calculation")



    calculation_string = `  @@${id1}  `
    units = ""
    expected_prepared_units = "seconds"
    prepared_units = apply_units_from_component(calculation_string, units, wcomponents_by_id)
    test(prepared_units, expected_prepared_units, "Uses a wcomponent's units, even with surrounding whitespace")



    calculation_string = `@@${id1}`
    units = "Unitless"
    expected_prepared_units = "seconds"
    prepared_units = apply_units_from_component(calculation_string, units, wcomponents_by_id)
    test(prepared_units, expected_prepared_units, "Silently uses a wcomponent's units even when units given by calculation")



    calculation_string = `@@${id1} + 1`
    units = "meters"
    expected_prepared_units = "meters"
    prepared_units = apply_units_from_component(calculation_string, units, wcomponents_by_id)
    test(prepared_units, expected_prepared_units, "Ignores component units if calculation value is not just a @@uuid")



    calculation_string = `@@${id2}`
    units = "meters"
    expected_prepared_units = "meters"
    prepared_units = apply_units_from_component(calculation_string, units, wcomponents_by_id)
    test(prepared_units, expected_prepared_units, "Defaults to units set in calculation if component can not be found")

}, false)
