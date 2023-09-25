


export const old_ids_regex = /.*?(@@\w*\d+)/g
const uuids_regex = /^([0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})$/gi
export const double_at_mentioned_uuids_regex = /.*?(@@[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})/gi

export function is_valid_uuid (uuid: string)
{
    return !!uuid.match(uuids_regex)
}

export const old_ids_and_functions_regex = /.*?(@@\w*\d+)\.([\w]+)/g
export const uuids_and_functions_regex = /.*?(@@[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})\.([\w]+)/gi


export const non_square_bracket_ids_regex = /(?:^|.*?[^\[a-zA-Z0-9_])([a-zA-Z][a-zA-Z0-9_]*)/gi
export const square_bracket_ids_regex = /.*?\[([^\]]+)\]/gi
export const curly_bracket_content_regex = /.*?\{([^\}]+)\}/gi
