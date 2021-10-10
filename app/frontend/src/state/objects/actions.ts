import type { Action, AnyAction } from "redux"

import type { CreationContextState } from "../creation_context/state"
import { get_new_created_ats } from "../../shared/utils/datetime"
import { get_new_object_id } from "../../shared/utils/ids"
import type { CoreObject, CoreObjectAttribute, ObjectWithCache } from "../State"



interface ActionAddObject extends Action, CoreObject {}

const add_object_type = "add_object"


export interface AddObjectProps
{
    pattern_id: string

    attributes: CoreObjectAttribute[]
    labels: string[]
    external_ids: { [application: string]: string },
}
const add_object = (args: AddObjectProps, creation_context: CreationContextState): ActionAddObject =>
{
    const { created_at: datetime_created } = get_new_created_ats(creation_context)
    const id = get_new_object_id()

    return {
        type: add_object_type,
        id,
        datetime_created,
        pattern_id: args.pattern_id,
        attributes: args.attributes,
        labels: args.labels,
        external_ids: args.external_ids,
    }
}

export const is_add_object = (action: AnyAction): action is ActionAddObject => {
    return action.type === add_object_type
}


//

interface ActionDeleteObject extends Action {
    id: string
}

const delete_object_type = "delete_object"

const delete_object = (id: string): ActionDeleteObject =>
{
    return { type: delete_object_type, id }
}

export const is_delete_object = (action: AnyAction): action is ActionDeleteObject => {
    return action.type === delete_object_type
}


//

interface ActionUpdateObject extends Action, CoreObject {}

const update_object_type = "update_object"


export interface UpdateObjectProps extends CoreObject {}
const update_object = (args: UpdateObjectProps): ActionUpdateObject =>
{
    return {
        type: update_object_type,
        id: args.id,
        datetime_created: args.datetime_created,
        pattern_id: args.pattern_id,
        attributes: args.attributes,
        labels: args.labels,
        external_ids: args.external_ids,
    }
}

export const is_update_object = (action: AnyAction): action is ActionUpdateObject => {
    return action.type === update_object_type
}


//

interface ActionUpsertObjects extends Action {
    objects: CoreObject[]
}

const upsert_objects_type = "upsert_objects"


interface UpsertObjectsProps
{
    objects: CoreObject[]
}
const upsert_objects = (args: UpsertObjectsProps): ActionUpsertObjects =>
{
    return {
        type: upsert_objects_type,
        objects: args.objects.map(o => ({
            ...o,
            id: o.id || get_new_object_id(),
        })),
    }
}

export const is_upsert_objects = (action: AnyAction): action is ActionUpsertObjects => {
    return action.type === upsert_objects_type
}


//

interface ActionReplaceAllCoreObjects extends Action {
    objects: CoreObject[]
}

const replace_all_core_objects_type = "replace_all_core_objects"


interface ReplaceAllCoreObjectsProps
{
    objects: CoreObject[]
}
const replace_all_core_objects = (args: ReplaceAllCoreObjectsProps): ActionReplaceAllCoreObjects =>
{
    return {
        type: replace_all_core_objects_type,
        objects: args.objects,
    }
}

export const is_replace_all_core_objects = (action: AnyAction): action is ActionReplaceAllCoreObjects => {
    return action.type === replace_all_core_objects_type
}


//

interface ActionReplaceAllObjectsWithCache extends Action {
    objects: ObjectWithCache[]
}

const replace_all_objects_with_cache_type = "replace_all_objects_with_cache"


interface ReplaceAllObjectsWithCacheProps
{
    objects: ObjectWithCache[]
}
const replace_all_objects_with_cache = (args: ReplaceAllObjectsWithCacheProps): ActionReplaceAllObjectsWithCache =>
{
    return {
        type: replace_all_objects_with_cache_type,
        objects: args.objects,
    }
}

export const is_replace_all_objects_with_cache = (action: AnyAction): action is ActionReplaceAllObjectsWithCache => {
    return action.type === replace_all_objects_with_cache_type
}


//

export const object_actions = {
    add_object,
    delete_object,
    update_object,
    upsert_objects,
    replace_all_core_objects,
    replace_all_objects_with_cache,
}
