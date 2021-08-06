import type { CoreObject } from "../../../state/State"
import { get_new_object_id } from "../../../shared/utils/ids"
import type { TransformAirtableRecordArgs } from "../interfaces"
import { EXTERNAL_ID_KEY, PATTERN_ID_ACTION_V2 } from "../common"
import { airtable_multi_field_to_multi_attributes, airtable_multi_field_to_single_attribute, num_to_string, date_string_to_string } from "./common"



export interface AirtableAction
{
    id: string
    createdTime: string
    fields: Partial<{
        name: string
        projects: string[]
        description: string
        status: "Icebox" | "Todo" | "In progress" | "Done" | "Rejected"
        encompassing_action: string[]  // should only be 0 or 1 value
        depends_on_actions: string[]  // 0+ values
        why: string
        time_h: number
        start_datetime: string
        stop_datetime: string
        "Action Type": "Is Spike" | "Is Conditional"
        deadline_review_datetime: string
        is_project: true
    }>
}

export function transform_airtable_action (args: TransformAirtableRecordArgs<AirtableAction>): CoreObject | undefined
{
    const { pattern, get_temp_id } = args
    if (pattern.id !== PATTERN_ID_ACTION_V2) throw new Error(`transform_airtable_action requires Action pattern`)
    const ar = args.airtable_record
    const eo = args.existing_object

    if (!ar.fields.name || ar.fields.name === "_") return undefined

    const new_object: CoreObject = {
        id: (eo && eo.id) || get_new_object_id(),
        datetime_created: eo ? eo.datetime_created : new Date(ar.createdTime),
        labels: [],
        pattern_id: pattern.id,
        external_ids: { [EXTERNAL_ID_KEY]: ar.id, ...((eo && eo.external_ids) || {}) },
        attributes: [
            { pidx: 0, value: ar.fields.name || "" },
            ...airtable_multi_field_to_multi_attributes({ pidx: 1, field: ar.fields.projects, get_temp_id }),
            { pidx: 2, value: ar.fields.description || "" },
            { pidx: 3, value: ar.fields.status || "" },
            airtable_multi_field_to_single_attribute({ pidx: 4, field: ar.fields.encompassing_action, get_temp_id }),
            ...airtable_multi_field_to_multi_attributes({ pidx: 5, field: ar.fields.depends_on_actions, get_temp_id }),
            { pidx: 6, value: ar.fields.why || "" },
            { pidx: 7, value: num_to_string(ar.fields.time_h) },
            { pidx: 8, value: date_string_to_string(ar.fields.start_datetime) },
            { pidx: 9, value: date_string_to_string(ar.fields.stop_datetime) },
            { pidx: 10, value: ar.fields["Action Type"] || "" },
            { pidx: 11, value: date_string_to_string(ar.fields.deadline_review_datetime) },
            { pidx: 12, value: ar.fields.is_project ? "(Project)" : "" },
        ],
    }

    return new_object
}
