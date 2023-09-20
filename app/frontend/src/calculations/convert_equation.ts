import { non_square_bracket_ids_regex } from "../sharedf/rich_text/id_regexs"
import { get_ids_from_text } from "../sharedf/rich_text/replace_normal_ids"
import { SIMULATION_JS_RESERVED_WORDS } from "./reserved_words"



export function convert_equation (equation: string): string
{
    let converted_equation = equation

    const uuid_v4s = get_ids_from_text(equation)
    uuid_v4s.forEach((id, index) =>
    {
        const replacer = new RegExp(`@@${id}`, "g")

        const replacement_content = `[uuidv4${index}]`

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


    uuid_v4s.forEach((id, index) =>
    {
        const replacer = new RegExp(`\\[uuidv4${index}\\]`, "g")

        const replacement_content = `[${id}]`

        converted_equation = converted_equation.replace(replacer, replacement_content)
    })


    return converted_equation
}



export function get_non_square_bracket_ids_from_text (text: string): string[]
{
    const matches = [ ...text.matchAll(non_square_bracket_ids_regex) ]
    return matches.map(entry => entry[1]!)
}


function exclude_reserved_simulationjs_words (potential_non_square_bracket_ids: string[])
{
    return potential_non_square_bracket_ids.filter(id => !SIMULATION_JS_RESERVED_WORDS.has(id))
}
