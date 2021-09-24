import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "../common.scss"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { get_supabase } from "../../supabase/get_supabase"
import { DisplaySupabasePostgrestError } from "./DisplaySupabaseErrors"
import { selector_need_to_set_user_name } from "../../state/user_info/selector"
import type { SupabaseUser } from "../../supabase/interfaces"
import type { PostgrestError } from "@supabase/postgrest-js"
import { useEffect } from "preact/hooks"
import { pub_sub } from "../../state/pub_sub/pub_sub"



interface OwnProps {
    on_close: () => void
}


const map_state = (state: RootState) =>
{
    return {
        user: state.user_info.user,
        user_name: state.user_info.user_name,
        need_to_set_user_name: selector_need_to_set_user_name(state),
    }
}

const map_dispatch = {}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


type AsyncState = "initial" | "in_progress" | "success" | "error"


function _UserAccountInfoChangeUsernameForm (props: Props)
{
    const { on_close, user, user_name: stored_user_name, need_to_set_user_name } = props

    const [username, set_username] = useState("")
    const [save_state, set_save_state] = useState<AsyncState>("initial")
    const is_saving = save_state === "in_progress"
    const [postgrest_error, set_postgrest_error] = useState<PostgrestError | null>(null)


    useEffect(() => set_username(stored_user_name || ""), [stored_user_name])

    if (!user) return null
    const { id: user_id } = user


    async function update_username ()
    {
        const supabase = get_supabase()

        set_save_state("in_progress")

        const { data, error } = await supabase
            .from<SupabaseUser>("users")
            .upsert({ id: user_id, name: username })
            .eq("id", user_id)

        set_postgrest_error(error)
        const actual_set_username = (data && data[0]?.name) ?? undefined
        if (actual_set_username) pub_sub.user.pub("stale_users_by_id", true)
        set_save_state(error ? "error" : "success")
    }


    return <div className="section">
        <form>
            <input type="text" placeholder="Username" value={username} disabled={is_saving}
                onKeyUp={e => set_username(e.currentTarget.value)}
                onChange={e => set_username(e.currentTarget.value)}
                onBlur={async e => set_username(e.currentTarget.value)}
            /><br/>
        </form>

        <input
            type="button"
            disabled={!username || is_saving}
            onClick={update_username}
            value={`${need_to_set_user_name ? "Set" : "Change"} username`}
        /><br/>

        {is_saving && "Saving..."}
        {save_state === "success" && "Saved."}
        <br />

        {!need_to_set_user_name && <input
            type="button"
            onClick={() =>
            {
                on_close()
                set_postgrest_error(null)
            }}
            value="Close"
        />}<br />

        <DisplaySupabasePostgrestError error={postgrest_error} />
    </div>
}

export const UserAccountInfoChangeUsernameForm = connector(_UserAccountInfoChangeUsernameForm) as FunctionalComponent<OwnProps>
