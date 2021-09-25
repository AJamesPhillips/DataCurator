import { h } from "preact"
import EditIcon from "@material-ui/icons/Edit"

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
    on_click_edit: () => void
}


export function StorageOption (props: OwnProps)
{
    const { user, users_by_id, base, selected, on_click, on_click_edit } = props

    const { title, id, public_read, access_level } = base

    const is_owner = base.owner_user_id === user.id
    const is_editor = access_level === "editor"
    const owner_or_editor = is_editor || is_owner
    const access_description = is_owner ? "Editor (Owner)"
        : is_editor ? "Editor"
        : access_level === "viewer" ? "Viewer"
        : base.public_read ? "Viewer (public access)" : "?"

    return <tr
        className={"base_option " + (selected ? "selected" : "") }
        onClick={on_click}
    >
        <td className="narrow"><input type="radio" checked={selected} style={{ cursor: "pointer" }} /></td>
        <td>
            {title || "(No title)"}
        </td>
        <td>{public_read && "(Public)"}</td>

        <td>{get_user_name_for_display({ users_by_id, current_user_id: user?.id, other_user_id: base.owner_user_id })}</td>
        <td>{access_description}</td>

        <td className="narrow" style={{ color: "grey", fontSize: 12 }}>{id}</td>
        <td className="narrow edit_title" onClick={!owner_or_editor ? undefined : e =>
            {
                e.stopImmediatePropagation()
                on_click_edit()
            }}
        >
            {owner_or_editor && <EditIcon />}
        </td>
    </tr>
}
