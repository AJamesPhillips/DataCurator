import { test } from "../../../shared/utils/test"
import { CreationContextState } from "../../../state/creation_context/state"
import { uuid_v4_for_tests } from "../../../utils/uuid_v4_for_tests"
import { prepare_new_VAP_set } from "../../../wcomponent/CRUD_helpers/prepare_new_VAP_set"
import { prepare_new_wcomponent_object } from "../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { WComponentsById } from "../../../wcomponent/interfaces/SpecialisedObjects"
import { VAPsType } from "../../../wcomponent/interfaces/VAPsType"
import { replace_calculations_with_results } from "./replace_calculations_with_results"
import { ReplaceCalculationsWithResults } from "./interfaces"



export function run_replace_calculations_with_results_tests ()
{
    console. group("running tests of replace_calculations_with_results")

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
    let output_text = ""
    let expected_output_text = ""


    input_text = ``
    output_text = replace_calculations_with_results(input_text, args)
    test(output_text, "", "Should find no calculations in an empty string")


    input_text = `
$$!
$$!
`
    expected_output_text = `
<code>Empty calculation</code>
`
    output_text = replace_calculations_with_results(input_text, args)
    test(output_text, expected_output_text, "Should error on finding no value in a calculations")


    input_text = `
$$!
`
    expected_output_text = `
$$!
`
    output_text = replace_calculations_with_results(input_text, args)
    test(output_text, expected_output_text, "Should find no calculations with unmatched calculation $$!")



    input_text = `
$$!
calculation_of_something: A * B
$$!
`
    expected_output_text = `
<code>Calculation missing value attribute</code>
`
    output_text = replace_calculations_with_results(input_text, args)
    test(output_text, expected_output_text, "Should error when calculation block is missing value")


    input_text = `
$$!
calculation_of_something: A * B
$$!

$$!
calculation_of_something: A * B
$$!
`
    expected_output_text = `
<code>Calculation missing value attribute</code><br /><br /><code>Calculation missing value attribute</code>
`
    output_text = replace_calculations_with_results(input_text, args)
    test(output_text, expected_output_text, "Should insert breaks between calculations that error (and are therefore represented by code blocks)")


    input_text = `
$$!
calculation_of_something: A * B
$$! $$!
calculation_of_something: A * B
$$!
`
    expected_output_text = `
<code>Calculation missing value attribute</code>&nbsp; <code>Calculation missing value attribute</code>
`
    output_text = replace_calculations_with_results(input_text, args)
    test(output_text, expected_output_text, "Should insert two spaces (including one &nbsp;) between calculations that have a space between them and that also error (and are therefore represented by code blocks)")


    input_text = `
$$!
value: 123
$$!
`
    expected_output_text = `
123
`
    output_text = replace_calculations_with_results(input_text, args)
    test(output_text, expected_output_text, "Should replace $$! and content between with calculation text")


    input_text = `
$$!
value: "@@${id1}"
$$!
`
    expected_output_text = `
[27000000 UK Homes](#wcomponents/${id1})
`
    output_text = replace_calculations_with_results(input_text, args)
    test(output_text, expected_output_text, "Should replace an id of a component whose state is a numeric value with its value, and component title ")


    input_text = `
$$!
name: A
value: "@@${id1}"
$$!
`
    expected_output_text = `
A = [27000000 UK Homes](#wcomponents/${id1})
`
    output_text = replace_calculations_with_results(input_text, args)
    test(output_text, expected_output_text, "Should prepend the name and an equals sign")


    input_text = `
$$!
name: C
value: A
$$!
`
    expected_output_text = `
C = A
`
    output_text = replace_calculations_with_results(input_text, args)
    test(output_text, expected_output_text, "Should reproduce equations when names not found")


    input_text = `
$$!
name: A
value: 123
$$!

$$!
value: 0.01
$$!

$$!
value: A * B
$$!
`
    // Simpler test case first, should be able to recognise this value is a
    // calculation / equation with more than one value in it and therefore
    // append an equals sign to it
    expected_output_text = `
A = 123

0.01

A * B = <Some warning symbol with a message something like: "Missing value 'B'" >
`
    output_text = replace_calculations_with_results(input_text, args)
    test.skip(output_text, expected_output_text, "Should partially populate equations when not all names are found")


    input_text = `
$$!
name: A
value: 123
$$!

$$!
name: B
value: 0.01
$$!

$$!
value: A * B
$$!
`
    expected_output_text = `
A = 123

B = 0.01

A * B = 123 * 0.01 = 1.23
`
    output_text = replace_calculations_with_results(input_text, args)
    test.skip(output_text, expected_output_text, "Should populate equations when all names are found and calculate result")


    console. groupEnd()
}


// run_replace_calculations_with_results_tests()
