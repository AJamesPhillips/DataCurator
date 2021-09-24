import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "../common.scss"
import type { RootState } from "../../state/State"
import type { SupabaseKnowledgeBaseWithAccess } from "../../supabase/interfaces"
import { useState } from "react"
import { modify_base } from "../../supabase/bases"
import { pub_sub } from "../../state/pub_sub/pub_sub"
import type { PostgrestError } from "@supabase/postgrest-js"
import { DisplaySupabasePostgrestError } from "../user_info/DisplaySupabaseErrors"



interface OwnProps
{
    base: SupabaseKnowledgeBaseWithAccess
    on_save_or_exit: () => void
}



const map_state = (state: RootState) =>
{
    return {
        user: state.user_info.user,
    }
}

const map_dispatch = {
    // update_bases: ACTIONS.user_info.update_bases,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _BaseForm (props: Props)
{
    const { base, on_save_or_exit, user } = props

    const [modified_base, set_modified_base] = useState(base)
    const [error_modifying_base, set_error_modifying_base] = useState<PostgrestError | undefined>(undefined)

    if (!user) return "Please sign in"


    const { access_level } = base

    const is_owner = base.owner_user_id === user.id
    const owner_or_editor = access_level === "editor" || is_owner
    const access_description = owner_or_editor ? "Editor"
        : access_level === "viewer" ? "Viewer"
        : base.public_read ? "Viewer (public access)" : "?"

    const have_pending_edits = JSON.stringify(base) !== JSON.stringify(modified_base)
    const valid_edits = !!modified_base.title


    function update_title (e: h.JSX.TargetedEvent<HTMLInputElement>)
    {
        const title = e.currentTarget.value.trim()
        set_modified_base({ ...modified_base, title })
    }


    return <div style={{ margin: 10 }}>
        {is_owner && <div>
            <h4>Edit base</h4>

            Title &nbsp; <input
                type="text"
                placeholder="title"
                value={modified_base.title}
                onKeyDown={update_title}
                onChange={update_title}
                onBlur={update_title}
            />
            <br /><br />

            Visibility &nbsp; <input
                type="button"
                onClick={() =>
                {
                    set_modified_base({ ...modified_base, public_read: !modified_base.public_read })
                }}
                value={modified_base.public_read ? "Make private" : "Publish (make public)"}
            />
            <br />
            <br />

            <div>
                <input
                    type="button"
                    disabled={!have_pending_edits || !valid_edits}
                    onClick={async () =>
                    {
                        const res = await modify_base(modified_base)
                        if (res.error) return set_error_modifying_base(res.error)

                        set_error_modifying_base(undefined)
                        pub_sub.user.pub("stale_bases", true)
                    }}
                    value="Save changes"
                />
                <input
                    type="button"
                    onClick={on_save_or_exit}
                    value={have_pending_edits ? "Cancel" : "Back"}
                />

                <DisplaySupabasePostgrestError error={error_modifying_base} />
            </div>

            <br />
            <hr />
        </div>}

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

export const BaseForm = connector(_BaseForm) as FunctionalComponent<OwnProps>
