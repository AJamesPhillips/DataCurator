import { test } from "../../../shared/utils/test"
import { uuid_v4_for_tests } from "../../../utils/uuid_v4_for_tests"



const calculation_block_regex = /\$\$\!(.*?)\$\$\!/gs

export function get_calculation_strs_from_text (text: string): string[]
{
    const matches = [ ...text.matchAll(calculation_block_regex) ]
    return matches.map(entry => entry[1]!)
}


function test_get_calculation_strs_from_text ()
{
    console. log("running tests of get_calculation_strs_from_text")

    const id1 = "@@" + uuid_v4_for_tests(1)


    let calculations = get_calculation_strs_from_text("")
    test(calculations, [], "Should find no calculations when empty string")


    calculations = get_calculation_strs_from_text(`
asd1 ${id1}
$!
asd2
`)
    test(calculations, [], "Should not find any calculations when incomplete $$! is present")


    calculations = get_calculation_strs_from_text(`
asd1 ${id1}
$$!
asd2
`)
    test(calculations, [], "Should not find any calculations when unmatched $$! is present")


    calculations = get_calculation_strs_from_text(`
asd1 ${id1}

$$! asd2 $$!

$$!
    asd3
$$!
`)
    test(calculations, [" asd2 ", "\n    asd3\n"], "Should find calculations on single and multiple lines")


    calculations = get_calculation_strs_from_text(`
asd1 ${id1}
 $$! asd2 ${id1} $$!

 $$!
 asd3
 $$!
`)
    test(calculations, [` asd2 ${id1} `, "\n asd3\n "], "Should find calculations when indented $$! is present")


    // Ignoring this for now (2023-07-28) as I think it's of minimal value & importance
//     calculations = get_calculation_strs_from_text(`
// asd1 ${id1}
// \`\`\`
// $$! asd2 $$!
// \`\`\`

//     $$!
//     asd3
//     $$!
// `)
//     test(calculations, [], "Should not find calculations when inside code blocks")
}



function run_tests ()
{
    test_get_calculation_strs_from_text()
}

// run_tests()
