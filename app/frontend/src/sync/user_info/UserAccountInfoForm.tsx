import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "../common.scss"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { get_supabase } from "../../supabase/get_supabase"
import { DisplaySupabaseSessionError } from "./DisplaySupabaseSessionError"



interface OwnProps {
    on_close?: () => void
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




function _UserAccountInfoForm (props: Props)
{
    const { user, need_to_handle_password_recovery, set_user, set_need_to_handle_password_recovery } = props

    const [updating_password, set_updating_password] = useState(false)
    const [password, set_password] = useState("")
    const [supabase_session_error, set_supabase_session_error] = useState<Error | null>(null)

    if (!user) return null

    const supabase = get_supabase()



    async function update_password ()
    {
        // There should always be an email and password given on password update
        const email = user?.email
        const result = await supabase.auth.update({ email, password, /* data: {} */ })

        set_supabase_session_error(result.error)
        set_user({ user: result.user })
        if (!result.error) set_need_to_handle_password_recovery(false)
    }


    async function log_out ()
    {
        const { error } = await supabase.auth.signOut()
        set_supabase_session_error(error)
        set_user({ user: supabase.auth.user() })
        set_password("")
    }



    if (updating_password) return <div className="section">
        <input type="button" disabled={!(user?.email) || !password} onClick={update_password} value="Update password" /><br/>
        {!need_to_handle_password_recovery && <input type="button" onClick={() => set_updating_password(false)} value="Cancel" />}<br />
    </div>


    return <div>
        <div className="section">
            Logged in with {user.email} {user.id}<br />
            <input type="button" onClick={log_out} value="Log out" /><br />
            <input type="button" onClick={() => set_updating_password(true)} value="Change password" /><br />
        </div>


        {updating_password && <div className="section">
            <form>
                <input type="password" placeholder="password" value={password}
                    onKeyUp={e => set_password(e.currentTarget.value)}
                    onChange={e => set_password(e.currentTarget.value)}
                    onBlur={e => set_password(e.currentTarget.value)}
                /><br/>
            </form>

            <input type="button" disabled={!(user?.email) || !password} onClick={update_password} value="Update password" /><br/>
            {!need_to_handle_password_recovery && <input type="button" onClick={() => set_updating_password(false)} value="Cancel" />}<br />
        </div>}

        <DisplaySupabaseSessionError error={supabase_session_error} />
    </div>
}

export const UserAccountInfoForm = connector(_UserAccountInfoForm) as FunctionalComponent<OwnProps>
