import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import type { PostgrestError } from "@supabase/postgrest-js"

import { StorageOption } from "./StorageOption"
import type { RootState } from "../../state/State"
import { ACTIONS } from "../../state/actions"
import { sort_list } from "../../shared/utils/sort"
import { refresh_bases_for_current_user } from "../../state/user_info/utils"
import { SyncButton } from "../../sharedf/SyncButton"
import type { AsyncState } from "../../utils/async_state"
import { DisplaySupabasePostgrestError } from "../user_info/DisplaySupabaseErrors"



interface OwnProps
{
    on_choose?: () => void
    on_click_edit: (base_id: number) => void
}



const map_state = (state: RootState) =>
{
    return {
        user: state.user_info.user,
        users_by_id: state.user_info.users_by_id,
        chosen_base_id: state.user_info.chosen_base_id,
        bases_by_id: state.user_info.bases_by_id,
    }
}

const map_dispatch = {
    update_chosen_base_id: ACTIONS.user_info.update_chosen_base_id,
    // update_bases: ACTIONS.user_info.update_bases,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _AvailableBases (props: Props)
{
    const {
        on_choose, on_click_edit,
        user, users_by_id, chosen_base_id, bases_by_id, update_chosen_base_id,
    } = props


    const [async_state, set_async_state] = useState<AsyncState>("initial")
    const [error, set_error] = useState<PostgrestError | undefined>(undefined)


    if (!users_by_id) return "Loading users..."
    if (!bases_by_id) return "Loading bases..."


    const bases = sort_list(Object.values(bases_by_id), b => b.inserted_at.getTime(), "descending")


    if (bases.length === 0) return null


    return <div style={{ margin: 10 }}>
        <SyncButton
            state={async_state}
            title="Refresh sharing options"
            on_click={async () =>
            {
                set_async_state("in_progress")
                const res = await refresh_bases_for_current_user()
                set_async_state(res.error ? "error" : "success")
                set_error(res.error)
            }}
            style={{ float: "right" }}
        />

        <h4>Select an existing base</h4>

        <DisplaySupabasePostgrestError error={error} />

        <table>
        <thead>
            <tr>
                <th></th>
                <th>Knowledge Base Title</th>
                <th>{/* Public */}</th>
                <th>Owner</th>
                <th>Access</th>
                {/* <th>Id</th> */}
                <th>{/* Edit */}</th>
            </tr>
        </thead>
        <tbody>
        {bases.map(base =>
            <StorageOption
                user={user || undefined}
                users_by_id={users_by_id}
                base={base}
                selected={base.id === chosen_base_id}
                on_click={() =>
                {
                    update_chosen_base_id({ base_id: base.id })
                    on_choose && on_choose()
                }}
                on_click_edit={() => on_click_edit(base.id)}
            />
        )}
        </tbody>
        </table>
    </div>
}

export const AvailableBases = connector(_AvailableBases) as FunctionalComponent<OwnProps>
