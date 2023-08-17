import { test } from "../../../shared/utils/test"
import { CreationContextState } from "../../../state/creation_context/state"
import { uuid_v4_for_tests } from "../../../utils/uuid_v4_for_tests"
import { prepare_new_VAP_set } from "../../../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { prepare_new_wcomponent_object } from "../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentsById } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { VAPsType } from "../../../wcomponent/interfaces/VAPsType"
import { get_calculation_strs_from_text } from "./get_calculation_strs_from_text"
import { get_plain_calculation_object_from_str } from "./get_plain_calculation_object_from_str"
import { get_referenced_values } from "./get_referenced_values"
import { ReplaceCalculationsWithResults } from "./interfaces"



export function get_calculations_from_text (text: string, args: ReplaceCalculationsWithResults): string[]
{
    const calculation_strs = get_calculation_strs_from_text(text)

    const plain_calculation_objects = calculation_strs.map(get_plain_calculation_object_from_str)

    const calculation_object = plain_calculation_objects.map(o => get_referenced_values(o, args))

    return calculation_object.map(o => (o.valid ? o.value_str : "error"))
}



export function test_get_calculations_from_text ()
{
    console. group("running tests of get_calculations_from_text")

    const created_at_ms = new Date("2023-08-17 17:40").getTime()
    const sim_ms = new Date("2023-08-17 17:40").getTime()

    const creation_context: CreationContextState = {
        use_creation_context: false,
        creation_context: { label_ids: [] },
    }

    const id1 = uuid_v4_for_tests(1)
    const id1_VAP_set = prepare_new_VAP_set(VAPsType.number, {}, [], -1, creation_context)
    id1_VAP_set.created_at = new Date(created_at_ms - 1)
    id1_VAP_set.datetime.value = new Date(sim_ms - 1)
    id1_VAP_set.entries[0]!.value = "27000000"

    const wcomponents_by_id: WComponentsById = {
        [id1]: prepare_new_wcomponent_object({ base_id: -1, id: id1, title: "UK Homes", type: "statev2", values_and_prediction_sets: [id1_VAP_set] }, creation_context),
    }

    const args: ReplaceCalculationsWithResults = {
        wcomponents_by_id,
        depth_limit: 2,
        render_links: true,
        root_url: "",
        get_title: wc => wc.title,
        created_at_ms,
        sim_ms,
    }


    let input_text = ""
    let calculations: string[] = []


    input_text = ``
    calculations = get_calculations_from_text(input_text, args)
    test(calculations.length, 0, "Should find no calculations in an empty string")


    input_text = `
$$!
$$!
`
    calculations = get_calculations_from_text(input_text, args)
    test(calculations.length, 1, "Should find 1 calculation")
    test(calculations[0]!, "error", "Should error on finding no value in a calculations")


    input_text = `
$$!
`
    calculations = get_calculations_from_text(input_text, args)
    test(calculations.length, 0, "Should find no calculations with unmatched calculation $$!")


    input_text = `
$$!
value: 123
$$!
`
    calculations = get_calculations_from_text(input_text, args)
    test(calculations.length, 1, "Should find 1 calculation")
    test(calculations[0], `123`, "Should replace $$! and content between with calculation text")


    input_text = `
$$!
value: "@@${id1}"
$$!
`
    calculations = get_calculations_from_text(input_text, args)
    test(calculations.length, 1, "Should find 1 calculation")
    test(calculations[0], `[27000000 UK Homes](#wcomponents/${id1})`, "Should replace an id of a component whose state is a numeric value with its value, and component title ")


    input_text = `
$$!
name: A
value: "@@${id1}"
$$!
`
    calculations = get_calculations_from_text(input_text, args)
    test(calculations.length, 1, "Should find 1 calculation")
    test(calculations[0], `A = [27000000 UK Homes](#wcomponents/${id1})`, "Should prepend the name and an equals sign")

    console. groupEnd()
}

// test_get_calculations_from_text()
