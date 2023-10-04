import { SIMULATION_JS_RESERVED_WORDS } from "../../calculations/reserved_words"




export function get_valid_calculation_name_id (existing_calculation_name_ids: string[], proposed_name_id: string = "")
{
    const upper_case_candidate_name_id = proposed_name_id.toUpperCase()

    const disallowed_ids = get_disallowed_ids(existing_calculation_name_ids)
    if (proposed_name_id && !disallowed_ids.has(upper_case_candidate_name_id)) return proposed_name_id

    let candidate_name_id_num: number[] = name_id_string_to_num(proposed_name_id || "A")
    let candidate_name_id = num_to_name_id_string(candidate_name_id_num)

    while (disallowed_ids.has(candidate_name_id))
    {
        candidate_name_id_num = increase_candidate_name_id_num(candidate_name_id_num)
        candidate_name_id = num_to_name_id_string(candidate_name_id_num)
    }

    if (proposed_name_id)
    {

        candidate_name_id = match_case(candidate_name_id, proposed_name_id)
    }

    return candidate_name_id
}


function get_disallowed_ids (existing_calculation_name_ids: string[])
{
    const disallowed_ids = new Set([
        ...SIMULATION_JS_RESERVED_WORDS,
        ...existing_calculation_name_ids,
    ].map(entry => entry.toUpperCase().replaceAll(/\s*/g, "")))

    return disallowed_ids
}


function name_id_string_to_num (candidate_name_id: string)
{
    candidate_name_id = candidate_name_id.toUpperCase()
    return candidate_name_id.split("")
        .map(char => char.charCodeAt(0))
        .filter(num => num >= 65 && num <= 90) // character is >= A and <= Z
}


function num_to_name_id_string (candidate_name_id_nums: number[])
{
    return candidate_name_id_nums.map(num => String.fromCharCode(num)).join("")
}


function increase_candidate_name_id_num (candidate_name_id_num: number[])
{
    let needs_increase = false

    for (let i = candidate_name_id_num.length - 1; i >= 0; --i)
    {
        candidate_name_id_num[i] = candidate_name_id_num[i]! + 1

        // element > Z then A
        if (candidate_name_id_num[i]! > 90)
        {
            candidate_name_id_num[i] = 65
            needs_increase = true
        }
        else
        {
            needs_increase = false
            break
        }
    }

    if (needs_increase) candidate_name_id_num.push(65)

    return candidate_name_id_num
}



function match_case (base_string: string, source_string: string)
{
    return base_string.split("").map((char, idx) =>
    {
        const source_char = source_string.charCodeAt(idx)
        if (source_char >= 97 && source_char <= 122)
        {
            char = char.toLowerCase()
        }

        return char
    }).join("")
}
