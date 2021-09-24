import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "../common.scss"
import { StorageOption } from "./StorageOption"
import type { RootState } from "../../state/State"
import { ACTIONS } from "../../state/actions"
import { sort_list } from "../../shared/utils/sort"
import type { SupabaseKnowledgeBaseWithAccess } from "../../supabase/interfaces"
import { useState } from "react"



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

    if (!user) return "Please sign in"


    const { id, access_level } = base

    const is_owner = base.owner_user_id === user.id
    const owner_or_editor = access_level === "editor" || is_owner
    const access_description = owner_or_editor ? "Editor"
        : access_level === "viewer" ? "Viewer"
        : base.public_read ? "Viewer (public access)" : "?"

    const have_pending_edits = JSON.stringify(base) !== JSON.stringify(modified_base)


    return <div style={{ margin: 10 }}>
        {is_owner && <div>
            <h4>Edit base</h4>

            <input
                type="text"
                placeholder="title"
                value={modified_base.title}
                onBlur={e =>
                {
                    const new_title = e.currentTarget.value.trim()
                    if (!new_title)
                    {
                        e.currentTarget.value = modified_base.title
                        return
                    }
                    set_modified_base({ ...modified_base, title: new_title })
                }}
            />
            <br /><br />

            Publish (make <b>public</b>)<br />
            <input
                type="checkbox"
                checked={modified_base.public_read}
                onChange={e =>
                {
                    set_modified_base({ ...modified_base, public_read: e.currentTarget.checked })
                }}
            />{modified_base.public_read ? "(Public)" : "(Private)"}
            <br />

            {have_pending_edits && <div>
                <input type="button" onClick={() => {}} value="Save changes" />
                <input type="button" onClick={() => {}} value="Cancel" />
            </div>}

            <br />
            <hr />
        </div>}

        <h4>Sharing options</h4>

        {/* <td>{get_user_name_for_display({ users_by_id, user, other_user_id: base.owner_user_id })}</td> */}
        {access_description}
    </div>
}

export const BaseForm = connector(_BaseForm) as FunctionalComponent<OwnProps>
