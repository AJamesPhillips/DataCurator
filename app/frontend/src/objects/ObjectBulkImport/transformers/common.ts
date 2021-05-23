import { date2str_auto } from "../../../shared/utils/date_helpers"
import type { TempIdFunc } from "../interfaces"


interface AirtableMultiFieldToSingleAttributeArgs
{
    pidx: number
    field: string[] | undefined
    get_temp_id: TempIdFunc
}
export function airtable_multi_field_to_single_attribute (args: AirtableMultiFieldToSingleAttributeArgs)
{
    const { pidx, get_temp_id, field } = args
    const id = (field && field.length) ? get_temp_id(field[0]) : ""

    if (field && field.length > 1) console.warn(`Dropping fields: ${JSON.stringify(field.slice(1))}`)

    return { pidx, id }
}



interface AirtableMultiFieldToMultiAttributesArgs
{
    pidx: number
    field: string[] | undefined
    get_temp_id: TempIdFunc
}
export function airtable_multi_field_to_multi_attributes (args: AirtableMultiFieldToMultiAttributesArgs)
{
    const { pidx, get_temp_id, field } = args
    const field_normalised: string[] = field || []
    const attributes = field_normalised.map(v => ({ pidx, id: get_temp_id(v) }))

    return attributes.length ? attributes : [{ pidx, id: "" }]
}


export function date_string_to_string (v: string | undefined): string {
    if (!v) return ""

    const d = new Date(v)
    if (isNaN(d as any)) return ""

    return date2str_auto({ date: d })
}
export const num_to_string = (v: number | undefined): string => v === undefined ? "" : `${v}`
export const bool_to_string = (v: Boolean | undefined): string => v ? "Yes" : "No"
