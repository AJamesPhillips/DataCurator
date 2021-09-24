import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "../common.scss"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { get_supabase } from "../../supabase/get_supabase"
import { DisplaySupabaseSessionError } from "./DisplaySupabaseErrors"



interface OwnProps {
    on_close: () => void
}


const map_state = (state: RootState) =>
{
    return {
        user: state.user_info.user,
        need_to_handle_password_recovery: state.user_info.need_to_handle_password_recovery,
    }
}

const map_dispatch = {
    set_user: ACTIONS.user_info.set_user,
    set_need_to_handle_password_recovery: ACTIONS.user_info.set_need_to_handle_password_recovery,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps




function _UserAccountInfoChangePasswordForm (props: Props)
{
    const { on_close, user, need_to_handle_password_recovery, set_user, set_need_to_handle_password_recovery } = props

    const [password, set_password] = useState("")
    const [supabase_session_error, set_supabase_session_error] = useState<Error | null>(null)

    if (!user) return null


    async function update_password ()
    {
        const supabase = get_supabase()

        // There should always be an email and password given on password update
        const email = user?.email
        const result = await supabase.auth.update({ email, password, /* data: {} */ })
        set_supabase_session_error(result.error)

        if (!result.error)
        {
            set_user({ user: result.user })
            set_need_to_handle_password_recovery(false)
            on_close()
        }
    }

    return <div className="section">
        {need_to_handle_password_recovery && <div>Please set a new passowrd</div>}

        <form>
            <input type="password" placeholder="password" value={password}
                onKeyUp={e => set_password(e.currentTarget.value)}
                onChange={e => set_password(e.currentTarget.value)}
                onBlur={e => set_password(e.currentTarget.value)}
            /><br/>
        </form>

        <input
            type="button"
            disabled={!(user?.email) || !password}
            onClick={update_password}
            value="Update password"
        /><br/>

        {!need_to_handle_password_recovery && <input
            type="button"
            onClick={() =>
            {
                on_close()
                set_supabase_session_error(null)
            }}
            value="Cancel"
        />}<br />

        <DisplaySupabaseSessionError error={supabase_session_error} />
    </div>
}

export const UserAccountInfoChangePasswordForm = connector(_UserAccountInfoChangePasswordForm) as FunctionalComponent<OwnProps>
