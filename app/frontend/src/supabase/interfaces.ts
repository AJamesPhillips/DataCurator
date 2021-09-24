import type { KnowledgeView } from "../shared/wcomponent/interfaces/knowledge_view"
import type { WComponent } from "../shared/wcomponent/interfaces/SpecialisedObjects"



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
}
export interface JoinedAccessControlsPartial
{
    access_level: ACCESS_CONTROL_LEVEL
}
export interface DBSupabaseKnowledgeBaseWithAccess extends SupabaseKnowledgeBase
{
    access_controls?: JoinedAccessControlsPartial[]
}
export interface SupabaseKnowledgeBaseWithAccess extends SupabaseKnowledgeBase
{
    access_level?: ACCESS_CONTROL_LEVEL
}



// ++++++++++++++++ public.access_controls ++++++++++++++++

export type ACCESS_CONTROL_LEVEL = "editor" | "viewer" | "none"
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

interface SupabaseItem<I>
{
    id: string
    modified_at: Date
    base_id: number
    title: string
    json: I
}


export interface SupabaseKnowledgeView extends SupabaseItem<KnowledgeView> {}

export interface SupabaseWComponent extends SupabaseItem<WComponent> {}
