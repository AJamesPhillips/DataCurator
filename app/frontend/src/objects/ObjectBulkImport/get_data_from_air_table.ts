import { CoreObject, Pattern, ObjectWithCache, CoreObjectAttribute, is_id_attribute } from "../../state/State"
import type { AirtableToTempIdsMap, TempIdFunc } from "./interfaces"
import { get_bulk_import_settings } from "./ObjectBulkImportSetup"
import { get_transformation_function } from "./transformers/get_transformation_function"
import type { AirtableAction } from "./transformers/transform_airtable_action"
import { EXTERNAL_ID_KEY } from "./_common"



const TEMP_ID_PREFIX = "temp_id: "
export function temp_id_factory ()
{
    const temporary_ids_map: AirtableToTempIdsMap = {}

    const get_temp_id: TempIdFunc = id => {
        if (!id) return ""

        if (!temporary_ids_map.hasOwnProperty(id)) temporary_ids_map[id] = 0
        temporary_ids_map[id] += 1

        return `${TEMP_ID_PREFIX}${id}`
    }

    return {
        temporary_ids_map,
        get_temp_id,
    }
}


interface GetObjectsResult
{
    objects_with_temp_ids: CoreObject[]
    error: string
}

export async function get_data_from_air_table (pattern: Pattern, existing_objects: ObjectWithCache[], get_temp_id: TempIdFunc): Promise<GetObjectsResult>
{
    const { app, auth_key, models } = get_bulk_import_settings()
    const model = models.find(({ pattern_id }) => pattern_id === pattern.id)

    if (!model) {
        const error = `Pattern id "${pattern.id}" could not be found in localStorage.airtable_models`
        return { objects_with_temp_ids: [], error }
    }

    const { table_id, view_id } = model

    const url = (offset: string) =>
    {
        return `https://api.airtable.com/v0/${app}/${table_id}?view=${view_id}` + (offset ? `&offset=${offset}` : "")
    }

    let objects_with_temp_ids: CoreObject[] = []
    let offset: string = ""

    do
    {
        const result = await perform_request({
            pattern,
            url: url(offset),
            auth_key,
            existing_objects,
            get_temp_id,
        })

        if (result.error) return { objects_with_temp_ids: [], error: result.error }

        offset = result.offset
        objects_with_temp_ids = objects_with_temp_ids.concat(result.objects_with_temp_ids)

    } while (offset)

    return { objects_with_temp_ids, error: "" }
}



interface PerformRequestArgs
{
    pattern: Pattern
    url: string
    auth_key: string
    existing_objects: ObjectWithCache[]
    get_temp_id: TempIdFunc
}
async function perform_request (args: PerformRequestArgs)
{
    const { pattern, url, auth_key, existing_objects, get_temp_id } = args

    const transformation_function = get_transformation_function(pattern)

    if (!transformation_function)
    {
        const error = `Unsupported pattern: ${pattern.id}`
        return { objects_with_temp_ids: [], offset: "", error }
    }

    let response: Response
    try
    {
        response = await fetch(url, { headers: { "Authorization": `Bearer ${auth_key}` } })
    } catch (e)
    {
        return { objects_with_temp_ids: [], offset: "", error: `${e}` }
    }

    const d = await response.json() as { records: AirtableAction[], offset: string }

    const maybe_objects_with_temp_ids = d.records.map(airtable_record =>
    {
        const predicate = find_object_by_airtable_id(airtable_record.id)
        const existing_object = existing_objects.find(predicate)

        return transformation_function({ pattern, get_temp_id, airtable_record, existing_object })
    })

    const objects_with_temp_ids = maybe_objects_with_temp_ids.filter(o => !!o) as CoreObject[]

    return { objects_with_temp_ids, offset: d.offset, error: "" }
}





function find_object_by_airtable_id (airtable_id: string)
{
    return ({ external_ids }: ObjectWithCache) => {

        if (!external_ids) return false

        const id = external_ids[EXTERNAL_ID_KEY]
        if (!id) return false

        return id === airtable_id
    }
}



interface ReplaceTempIdsArgs
{
    objects_with_temp_ids: CoreObject[]
    existing_objects: CoreObject[]
    temporary_ids_map: AirtableToTempIdsMap
}
export function replace_temp_ids (args: ReplaceTempIdsArgs): CoreObject[]
{
    const { objects_with_temp_ids, existing_objects, temporary_ids_map } = args

    const airtable_id_map = build_airtable_id_map({
        objects_with_temp_ids,
        existing_objects,
        expected_airtable_ids: Object.keys(temporary_ids_map)
    })

    const objects = change_temp_ids({ objects_with_temp_ids, airtable_id_map })

    return objects
}



interface BuildAirtableIdMapArgs
{
    objects_with_temp_ids: CoreObject[]
    existing_objects: CoreObject[]
    expected_airtable_ids: string[]
}
type ID_MAP = { [ airtable_id: string]: string }
function build_airtable_id_map (args: BuildAirtableIdMapArgs): ID_MAP
{
    const { objects_with_temp_ids, existing_objects, expected_airtable_ids } = args

    const id_map: ID_MAP = {}

    mutate_id_map_with_objects(objects_with_temp_ids, id_map)
    mutate_id_map_with_objects(existing_objects, id_map)

    // Check all temporary_ids are present in map
    const missing_airtable_ids: Set<string> = new Set()
    expected_airtable_ids.forEach(airtable_id => {
        if (!id_map.hasOwnProperty(airtable_id)) missing_airtable_ids.add(airtable_id)
    })

    if (missing_airtable_ids.size)
    {
        throw new Error(`Missing ${missing_airtable_ids.size} airtable ids from objects`)
    }

    return id_map
}



function mutate_id_map_with_objects (objects: CoreObject[], id_map: ID_MAP)
{
    objects.forEach(o => {
        const airtable_id = o.external_ids[EXTERNAL_ID_KEY]

        if (!airtable_id) return

        if (!o.id)
        {
            throw new Error(`No id for object`)
        }

        if (id_map.hasOwnProperty(airtable_id) && id_map[airtable_id] !== o.id)
        {
            throw new Error(`Mismatch in id map: ${airtable_id} -> ${o.id} but already have ${airtable_id} -> ${id_map[airtable_id]}`)
        }

        id_map[airtable_id] = o.id
    })
}



interface ChangeTempIdsArgs
{
    objects_with_temp_ids: CoreObject[]
    airtable_id_map: ID_MAP
}
function change_temp_ids (args: ChangeTempIdsArgs)
{
    const { objects_with_temp_ids, airtable_id_map } = args

    return objects_with_temp_ids.map(o => replace_attributes_temp_ids(o, airtable_id_map))
}



function replace_attributes_temp_ids (object: CoreObject, airtable_id_map: ID_MAP): CoreObject
{
    let changed = false

    const new_attributes = object.attributes.map(a =>
    {
        const new_a = replace_attribute_temp_id(a, airtable_id_map)
        const attribute_changed = new_a !== a
        changed = changed || attribute_changed
        return attribute_changed ? new_a : a
    })

    return changed ? { ...object, attributes: new_attributes } : object
}



function replace_attribute_temp_id (attribute: CoreObjectAttribute, airtable_id_map: ID_MAP): CoreObjectAttribute
{
    let new_id: string | undefined = undefined

    if (is_id_attribute(attribute))
    {
        if (attribute.id.startsWith(TEMP_ID_PREFIX))
        {
            const temp_id = attribute.id.slice(TEMP_ID_PREFIX.length)
            if (!airtable_id_map.hasOwnProperty(temp_id)) throw new Error(`Uknown temp_id: ${temp_id}`)
            new_id = airtable_id_map[temp_id]
        }
    }

    return new_id === undefined ? attribute : { ...attribute, id: new_id }
}
