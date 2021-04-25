

export function get_datetime ()
{
    return new Date()
}


function get_new_id ()
{
    return (parseInt(Math.random().toString().slice(2)) + 100000).toString()
}
export const get_new_statement_id = () => "s" + get_new_id()
export const get_new_pattern_id = () => "p" + get_new_id()
export const get_new_object_id = () => "o" + get_new_id()
export const get_new_perception_id = () => "pe" + get_new_id()
export const get_new_wcomponent_id = () => "wc" + get_new_id()
export const get_new_prediction_id = () => "pr" + get_new_id()
export const get_new_value_id = () => "vl" + get_new_id()
export const get_new_value_and_prediction_set_id = () => "vps" + get_new_id()
export const get_new_vap_id = () => "vap" + get_new_id()
export const get_new_knowledge_view_id = () => "kv" + get_new_id()


const statement_id_regex = new RegExp(/^s\d/)
export const is_statement_id = (id: string | undefined | null) => !!id && statement_id_regex.test(id)

const pattern_id_regex = new RegExp(/^p\d/)
export const is_pattern_id = (id: string | undefined | null) => !!id && pattern_id_regex.test(id)

const object_id_regex = new RegExp(/^o\d/)
export const is_object_id = (id: string | undefined | null) => !!id && object_id_regex.test(id)

const perception_id_regex = new RegExp(/^pe\d/)
export const is_perception_id = (id: string | undefined | null) => !!id && perception_id_regex.test(id)

const wcomponent_id_regex = new RegExp(/^wc\d/)
export const is_wcomponent_id = (id: string | undefined | null) => !!id && wcomponent_id_regex.test(id)

const prediction_id_regex = new RegExp(/^pr\d/)
export const is_prediction_id = (id: string | undefined | null) => !!id && prediction_id_regex.test(id)

const knowledge_view_id_regex = new RegExp(/^kv\d/)
export const is_knowledge_view_id = (id: string | undefined | null) => !!id && knowledge_view_id_regex.test(id)



export function bounded (num: number, min: number, max: number): number
{
    return Math.max(Math.min(num, max), min)
}
