import { get_supabase } from "datacurator-core/supabase/get_supabase"
import { useState } from "preact/hooks"

import type { DB_ACCESS_CONTROL_LEVEL } from "../supabase/interfaces"
import { DisplaySupabasePostgrestError } from "../sync/user_info/DisplaySupabaseErrors"
import type { AsyncState } from "../utils/async_state"
import { SelectAccessLevelDropDown } from "./SelectAccessLevel"



interface AddAccessControlEntryProps
{
    base_id: number
    on_add_or_exit: (stale_access_controls: boolean) => void
}
export function AddAccessControlEntry (props: AddAccessControlEntryProps)
{
    const [user_id, set_user_id] = useState("")
    const [access_level, set_access_level] = useState<DB_ACCESS_CONTROL_LEVEL>("editor")
    const [adding_status, set_adding_status] = useState<AsyncState>("initial")
    const adding = adding_status === "in_progress"
    const added = adding_status === "success"
    const [postgrest_error, set_postgrest_error] = useState<Error | null>(null)

    const { base_id } = props


    return <div>
        Share with new user: <br />
        <input
            type="text"
            placeholder="User's ID"
            value={user_id}
            disabled={adding}
            style={{ minWidth: 200 }}
            onKeyUp={e => set_user_id(e.currentTarget.value)}
            onChange={e => set_user_id(e.currentTarget.value)}
            onBlur={e => set_user_id(e.currentTarget.value)}
        /> &nbsp;
        <SelectAccessLevelDropDown current_level={access_level} on_change={set_access_level} />

        <br />
        {adding && <span>Adding...</span>}
        {added && <span>Added.</span>}
        <DisplaySupabasePostgrestError error={postgrest_error} />
        <br />

        {user_id && <input
            type="button"
            onClick={async () =>
            {
                set_adding_status("in_progress")

                const supabase = get_supabase()
                const result = await supabase.rpc("invite_user_to_base", { base_id, user_id, access_level })
                const { status, error } = result

                set_postgrest_error(error)
                set_adding_status(error ? "error" : "success")

                if (!error)
                {
                    set_user_id("") // reset form
                    props.on_add_or_exit(true)
                }
            }}
            value="Add user"
            disabled={!user_id}
        />} &nbsp;

        <input
            type="button"
            onClick={() => props.on_add_or_exit(false)}
            value="Back"
        />
    </div>
}
