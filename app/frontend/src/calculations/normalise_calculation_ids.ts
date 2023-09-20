import { non_square_bracket_ids_regex, square_bracket_ids_regex } from "../sharedf/rich_text/id_regexs"
import { get_ids_from_text } from "../sharedf/rich_text/replace_normal_ids"
import { SIMULATION_JS_RESERVED_WORDS } from "./reserved_words"



export function normalise_calculation_ids_and_extract_uuids (equation: string): { uuids: string[], converted_calculation: string }
{
    const uuid_v4s = get_ids_from_text(equation)
    const converted_calculation = normalise_calculation_ids(equation, uuid_v4s)

    return { uuids: uuid_v4s, converted_calculation }
}


export function normalise_calculation_ids (equation: string, uuid_v4s: string[]): string
{
    let converted_equation = equation

    uuid_v4s.forEach(id =>
    {
        const replacer = new RegExp(`@@${id}`, "g")

        const replacement_content = `[${id}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })


    // Now make all square bracket ids not findable by non_square_bracket_ids_regex
    // (I can't figure out how to do this with a regex)
    // As some like the uuid will match on this:
    //     [10000000-0000-4000-a000-000000000000]
    //                         ^^^^
    // And some like ids with spaces will match:
    //     [ some id ]
    //       ^^^^ ^^
    const ids_to_hide = get_spaced_square_bracket_ids_from_text(converted_equation)
    ids_to_hide.forEach((id, index) =>
    {
        const replacer = new RegExp(`\\[${id}\\]`, "g")

        const replacement_content = `[id_to_hide${index}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })


    const potential_non_square_bracket_ids = get_non_square_bracket_ids_from_text(converted_equation)
    const non_square_bracket_ids = exclude_reserved_simulationjs_words(potential_non_square_bracket_ids)
    non_square_bracket_ids.forEach(id =>
    {
        const replacer = new RegExp(`(^|[^\\[])${id}`, "g")

        const replacement_content = `$1[${id}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })


    ids_to_hide.forEach((id, index) =>
    {
        const replacer = new RegExp(`\\[id_to_hide${index}\\]`, "g")

        const replacement_content = `[${id}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })


    return converted_equation
}



function get_spaced_square_bracket_ids_from_text (text: string): string[]
{
    const matches = [ ...text.matchAll(square_bracket_ids_regex) ]
    return matches.map(entry => entry[1]!)
}


function get_non_square_bracket_ids_from_text (text: string): string[]
{
    const matches = [ ...text.matchAll(non_square_bracket_ids_regex) ]
    return matches.map(entry => entry[1]!)
}


function exclude_reserved_simulationjs_words (potential_non_square_bracket_ids: string[])
{
    return potential_non_square_bracket_ids.filter(id => !SIMULATION_JS_RESERVED_WORDS.has(id.toLowerCase()))
}
