import { h } from "preact"
import { useState } from "preact/hooks"
import type { User as SupabaseAuthUser } from "@supabase/supabase-js"
import type { PostgrestError } from "@supabase/postgrest-js"

import "../common.scss"
import type { SupabaseKnowledgeBaseWithAccess } from "../../supabase/interfaces"
import { modify_base } from "../../supabase/bases"
import { pub_sub } from "../../state/pub_sub/pub_sub"
import { DisplaySupabasePostgrestError } from "../user_info/DisplaySupabaseErrors"



interface OwnProps
{
    user: SupabaseAuthUser
    base: SupabaseKnowledgeBaseWithAccess
    on_save_or_exit: () => void
}


export function BaseFormEditFields (props: OwnProps)
{
    const { base, on_save_or_exit, user } = props

    const [modified_base, set_modified_base] = useState(base)
    const [error_modifying_base, set_error_modifying_base] = useState<PostgrestError | undefined>(undefined)


    const is_owner = base.owner_user_id === user.id

    const have_pending_edits = JSON.stringify(base) !== JSON.stringify(modified_base)
    const valid_edits = !!modified_base.title


    function update_title (e: h.JSX.TargetedEvent<HTMLInputElement>)
    {
        const title = e.currentTarget.value.trim()
        set_modified_base({ ...modified_base, title })
    }


    if (!is_owner) return null


    return <div>
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
            {have_pending_edits && valid_edits && <input
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
            />} &nbsp;

            <input
                type="button"
                onClick={on_save_or_exit}
                value={have_pending_edits ? "Cancel" : "Back"}
            />
            <br />

            <DisplaySupabasePostgrestError error={error_modifying_base} />
        </div>

        <br />
        <hr />
    </div>
}
