import { h } from "preact"

import "./StorageOption.scss"
import type { SupabaseKnowledgeBaseWithAccess, SupabaseUsersById } from "../../supabase/interfaces"
import type { User as SupabaseAuthUser } from "@supabase/supabase-js"
import { get_user_name_for_display } from "../../supabase/users"



interface OwnProps
{
    user: SupabaseAuthUser
    users_by_id: SupabaseUsersById
    base: SupabaseKnowledgeBaseWithAccess
    selected: boolean
    on_click: () => void
}


export function StorageOption (props: OwnProps)
{
    const { user, users_by_id, base, selected } = props

    const { title, id, public_read, access_level } = base

    const access_description = access_level === "editor" ? "Editor"
        : access_level === "viewer" ? "Viewer"
        : base.public_read ? "Viewer (public access)" : "?"

    return <div
        className={"section storage_option " + (selected ? "selected" : "") }
        onClick={props.on_click}
    >
        <h3>{title || "(No title)"}</h3> {public_read && "(Public)"}

        Owned by: {get_user_name_for_display({ users_by_id, user, other_user_id: base.owner_user_id })} <br/>

        {access_description}<br />

        {base.owner_user_id !== user.id && <span>
            access: {access_description} &nbsp;
        </span>}

        id: {id}
    </div>
}
