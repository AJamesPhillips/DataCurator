import {
    curly_bracket_content_regex,
    non_square_bracket_ids_regex,
    square_bracket_ids_regex,
} from "../sharedf/rich_text/id_regexs"
import { SIMULATION_JS_RESERVED_WORDS } from "./reserved_words"



export function normalise_calculation_ids (equation: string, uuid_v4s: string[]): string
{
    let converted_equation = equation

    converted_equation = convert_double_at_sign_uuidv4s_into_square_brackets(uuid_v4s, converted_equation)


    // // Now make all square bracket ids not findable by non_square_bracket_ids_regex
    // // (I can't figure out how to modify the non_square_bracket_ids_regex to achieve this)
    // // As some like the uuid will match on this:
    // //     [10000000-0000-4000-a000-000000000000]
    // //                         ^^^^
    // // And some like ids with spaces will match:
    // //     [ some id ]
    // //       ^^^^ ^^
    // let hidden_ids
    // ({ hidden_ids, converted_equation } = hide_all_square_bracket_ids(converted_equation));

    // // Also need to temporarily hide content in curly brackets which matches on:
    // //     {4 miles} / {6.4e3 meters}
    // //        ^^^^^           ^^^^^^
    // //
    // let hidden_curly_bracket_content
    // ({ hidden_curly_bracket_content, converted_equation } = hide_all_curly_bracket_content(converted_equation))

    // converted_equation = wrap_all_non_square_bracket_ids_in_square_brackets(converted_equation)

    // converted_equation = unhide_all_hidden_curly_bracket_content(hidden_curly_bracket_content, converted_equation)
    // converted_equation = unhide_all_hidden_ids(hidden_ids, converted_equation)

    return converted_equation
}


function convert_double_at_sign_uuidv4s_into_square_brackets (uuid_v4s: string[], converted_equation: string)
{
    uuid_v4s.forEach(id =>
    {
        const replacer = new RegExp(`@@${id}`, "g")

        const replacement_content = `[${id}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })

    return converted_equation
}


function hide_all_square_bracket_ids (converted_equation: string)
{

    const ids_to_hide = get_square_bracket_ids_from_text(converted_equation)

    ids_to_hide.forEach((id, index) =>
    {
        const replacer = new RegExp(`\\[${id}\\]`, "g")

        const replacement_content = `[hidden_square_bracket_id_${index}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })

    return { hidden_ids: ids_to_hide, converted_equation }
}

function get_square_bracket_ids_from_text (text: string): string[]
{
    const matches = [ ...text.matchAll(square_bracket_ids_regex) ]
    return matches.map(entry => entry[1]!)
}


function hide_all_curly_bracket_content (converted_equation: string)
{

    const curly_bracket_content_to_hide = get_curly_bracket_content_from_text(converted_equation)

    curly_bracket_content_to_hide.forEach((curly_bracket_content, index) =>
    {
        curly_bracket_content = curly_bracket_content.replaceAll("^", "\\^")
        const replacer = new RegExp(`\\{${curly_bracket_content}\\}`, "g")

        const replacement_content = `[hidden_curly_bracket_content_${index}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })

    return { hidden_curly_bracket_content: curly_bracket_content_to_hide, converted_equation }
}

function get_curly_bracket_content_from_text (text: string): string[]
{
    const matches = [ ...text.matchAll(curly_bracket_content_regex) ]
    return matches.map(entry => entry[1]!)
}


function wrap_all_non_square_bracket_ids_in_square_brackets (converted_equation: string)
{
    const potential_non_square_bracket_ids = get_non_square_bracket_ids_from_text(converted_equation)
    const non_square_bracket_ids = exclude_reserved_simulationjs_words(potential_non_square_bracket_ids)

    non_square_bracket_ids.forEach(id =>
    {
        const replacer = new RegExp(`(^|[^\\[])${id}`, "g")

        const replacement_content = `$1[${id}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })

    return converted_equation
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


function unhide_all_hidden_curly_bracket_content (hidden_curly_bracket_content: string[], converted_equation: string)
{
    hidden_curly_bracket_content.forEach((curly_bracket_content, index) =>
    {
        const replacer = new RegExp(`\\[hidden_curly_bracket_content_${index}\\]`, "g")

        const replacement_content = `{${curly_bracket_content}}`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })

    return converted_equation
}


function unhide_all_hidden_ids (hidden_ids: string[], converted_equation: string)
{
    hidden_ids.forEach((id, index) =>
    {
        const replacer = new RegExp(`\\[hidden_square_bracket_id_${index}\\]`, "g")

        const replacement_content = `[${id}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })

    return converted_equation
}
