import type { KnowledgeView } from "../shared/interfaces/knowledge_view"
import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentType } from "../wcomponent/interfaces/wcomponent_base"



// ++++++++++++++++ public.users ++++++++++++++++

// Our "Public" users not the auth user table
export interface SupabaseUser
{
    id: string
    name: string
}
export type SupabaseUsersById = { [id: string]: SupabaseUser }

// ++++++++++++++++ public.bases ++++++++++++++++



export interface SupabaseKnowledgeBase
{
    id: number
    inserted_at: Date
    updated_at: Date
    owner_user_id: string
    public_read: boolean
    title: string
    default_knowledge_view_id?: string
}
export interface JoinedAccessControlsPartial
{
    access_level: ACCESS_CONTROL_LEVEL
    user_id: string
}
export interface DBSupabaseKnowledgeBaseWithAccess extends SupabaseKnowledgeBase
{
    access_controls?: JoinedAccessControlsPartial[]
}
export interface SupabaseKnowledgeBaseWithAccess extends SupabaseKnowledgeBase
{
    access_level: ACCESS_CONTROL_LEVEL
    can_edit: boolean
}



export type SupabaseKnowledgeBaseWithAccessById = { [id: string]: SupabaseKnowledgeBaseWithAccess }



// ++++++++++++++++ public.access_controls ++++++++++++++++

export type ACCESS_CONTROL_LEVEL = "owner" | "editor" | "viewer" | "none"
export interface DBSupabaseAccessControl
{
    base_id: number
    user_id: string
    access_level: ACCESS_CONTROL_LEVEL
}
export interface SupabaseAccessControl extends DBSupabaseAccessControl
{
    inserted_at: Date
    updated_at: Date
}



// ++++++++++++++++ public.knowledge_views and public.wcomponents ++++++++++++++++

export interface SupabaseWriteItem<I>
{
    id: string
    modified_at?: string
    base_id: number
    json: I
    // Not needed for update, only needed for create
    title: string
}

export interface SupabaseReadItem<I> extends SupabaseWriteItem<I>
{
    id: string
    modified_at: string
    base_id: number
    title: string
    json: I
}


export interface SupabaseWriteKnowledgeView extends SupabaseWriteItem<KnowledgeView> {}
export interface SupabaseReadKnowledgeView extends SupabaseReadItem<KnowledgeView> {}

export interface SupabaseWriteWComponent extends SupabaseWriteItem<WComponent> {
    type: WComponentType
    attribute_id: string | undefined
}
export interface SupabaseReadWComponent extends SupabaseReadItem<WComponent> {
    type: WComponentType // not needed but included otherwise type error
    attribute_id: string | undefined
}
