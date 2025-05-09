import type { PostgrestResponse } from "@supabase/supabase-js"

import { update_access_control } from "../supabase/access_controls"
import type { ACCESS_CONTROL_LEVEL, SupabaseAccessControl, SupabaseUsersById } from "../supabase/interfaces"
import { get_user_name_for_display } from "../supabase/users"
import { SelectAccessLevelDropDown } from "./SelectAccessLevel"



interface AccessControlEntryProps
{
    access_control: SupabaseAccessControl
    base_id: number
    users_by_id: SupabaseUsersById
    current_user_id: string | undefined
    is_owner: boolean
    on_update: (a: PostgrestResponse<SupabaseAccessControl>) => void
}


export function AccessControlEntry (props: AccessControlEntryProps)
{
    const { access_control, base_id, users_by_id, current_user_id, is_owner, on_update } = props
    const { user_id: other_user_id, access_level: current_level } = access_control

    const update = (grant: ACCESS_CONTROL_LEVEL) => update_access_control({
        base_id, other_user_id, grant,
    }).then(on_update)

    return <tr>
        <td>{get_user_name_for_display({ users_by_id: users_by_id, current_user_id, other_user_id })}</td>
        {/* <td>{current_level}</td> */}

        <td>
            <SelectAccessLevelDropDown
                disabled={!is_owner}
                current_level={current_level}
                title={is_owner ? "Select access level" : "Only owners can edit access levels"}
                on_change={update}
            />
        </td>
            {/* <SelectAccessLevel level="editor" current_level={current_level} on_click={update} /></td>
        <td><SelectAccessLevel level="viewer" current_level={current_level} on_click={update} /></td>
        <td><SelectAccessLevel level="none" current_level={current_level} on_click={update} /></td> */}
        <br />
    </tr>
}
