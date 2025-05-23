import type { PostgrestError, User as SupabaseAuthUser } from "@supabase/supabase-js"
import { FunctionalComponent } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { SyncButton } from "../sharedf/SyncButton"
import { pub_sub } from "../state/pub_sub/pub_sub"
import type { RootState } from "../state/State"
import { get_access_controls_for_base } from "../supabase/access_controls"
import type { SupabaseAccessControl, SupabaseKnowledgeBaseWithAccess } from "../supabase/interfaces"
import { DisplaySupabasePostgrestError } from "../sync/user_info/DisplaySupabaseErrors"
import type { AsyncState } from "../utils/async_state"
import { AccessControlEntry } from "./AccessControlEntry"
import { AddAccessControlEntry } from "./AddAccessControl"
import "./BaseFormEditSharing.scss"



interface OwnProps
{
    user: SupabaseAuthUser
    base: SupabaseKnowledgeBaseWithAccess
    on_save_or_exit: () => void
}


const map_state = (state: RootState) => ({
    users_by_id: state.user_info.users_by_id,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _BaseFormEditSharing (props: Props)
{
    const { user, base, on_save_or_exit, users_by_id } = props

    const [async_state, set_async_state] = useState<AsyncState>("initial")
    const [access_controls, set_access_controls] = useState<SupabaseAccessControl[] | undefined>(undefined)
    const [error, set_error] = useState<PostgrestError | undefined>(undefined)

    const is_owner = base.owner_user_id === user.id
    // const access_description = owner_or_editor ? "Editor"
    //     : access_level === "viewer" ? "Viewer"
    //     : base.public_read ? "Viewer (public access)" : "?"


    function refresh_sharing_options ()
    {
        set_async_state("in_progress")
        get_access_controls_for_base(base.id)
        .then(res =>
        {
            set_async_state(res.error ? "error" : "success")
            set_access_controls(res.access_controls)
            set_error(res.error || undefined)

            if (res.error) return

            pub_sub.user.pub("stale_users_by_id", false)
        })
    }


    useEffect(() => refresh_sharing_options(), [])

    if (!users_by_id) return <div>Fetching users...</div>


    return <div>
        <SyncButton
            state={async_state}
            title="Refresh sharing options"
            on_click={() => refresh_sharing_options()}
            style={{ float: "right" }}
        />

        <h4>Sharing options</h4>


        <DisplaySupabasePostgrestError error={error} />


        {access_controls && <div>
            {access_controls.length === 0 && "Not shared with anyone yet"}

            {access_controls.length > 0 && <table className="access_controls_table">
            {/* <thead>
                <tr>
                    <th>User</th>
                    <th>Access</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            </thead> */}

            <tbody>
            {access_controls.map(ac => <AccessControlEntry
                access_control={ac}
                base_id={base.id} users_by_id={users_by_id} current_user_id={user.id}
                is_owner={is_owner}
                on_update={res => {
                    set_error(res.error || undefined)
                    if (!res.error) refresh_sharing_options()
                }}
            />)}
            </tbody>
            </table>}

            <br />
            {/* Id or email address of user's account: */}

        </div>}

        {!is_owner && <div>Sharing with new users (Only owners can do this for now)</div>}

        {is_owner && <AddAccessControlEntry
            base_id={base.id}
            on_add_or_exit={stale_access_controls =>
            {
                if (stale_access_controls) refresh_sharing_options()
                else on_save_or_exit()
            }}
        />}
    </div>
}

export const BaseFormEditSharing = connector(_BaseFormEditSharing) as FunctionalComponent<OwnProps>
