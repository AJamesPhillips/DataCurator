import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import type { User as SupabaseAuthUser } from "@supabase/supabase-js"

import "../common.scss"
import type { SupabaseKnowledgeBaseWithAccess } from "../../supabase/interfaces"
import { useState } from "react"
import type { PostgrestError } from "@supabase/postgrest-js"



interface OwnProps
{
    user: SupabaseAuthUser
    base: SupabaseKnowledgeBaseWithAccess
    on_save_or_exit: () => void
}



const connector = connect(null)
type Props = ConnectedProps<typeof connector> & OwnProps



function _BaseFormEditSharing (props: Props)
{
    const { base, on_save_or_exit, user } = props

    const [modified_base, set_modified_base] = useState(base)
    const [error_modifying_base, set_error_modifying_base] = useState<PostgrestError | undefined>(undefined)


    const { access_level } = base

    const is_owner = base.owner_user_id === user.id
    const owner_or_editor = access_level === "editor" || is_owner
    const access_description = owner_or_editor ? "Editor"
        : access_level === "viewer" ? "Viewer"
        : base.public_read ? "Viewer (public access)" : "?"


    if (!owner_or_editor) return null


    return <div>

        <h4>Sharing options</h4>

        {/* <td>{get_user_name_for_display({ users_by_id, user, other_user_id: base.owner_user_id })}</td> */}
        {access_description}

        <input
            type="button"
            onClick={on_save_or_exit}
            value="Back"
        />
    </div>
}

export const BaseFormEditSharing = connector(_BaseFormEditSharing) as FunctionalComponent<OwnProps>
