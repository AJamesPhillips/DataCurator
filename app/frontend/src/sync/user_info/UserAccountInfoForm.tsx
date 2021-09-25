import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "../common.scss"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { get_supabase } from "../../supabase/get_supabase"
import { DisplaySupabaseSessionError } from "./DisplaySupabaseErrors"
import { UserAccountInfoChangePasswordForm } from "./UserAccountInfoChangePasswordForm"
import { useEffect } from "preact/hooks"
import { selector_need_to_set_user_name } from "../../state/user_info/selector"
import { UserAccountInfoChangeUsernameForm } from "./UserAccountInfoChangeUsernameForm"



interface OwnProps {
    on_close?: () => void
}


const map_state = (state: RootState) =>
{
    return {
        user: state.user_info.user,
        user_name: state.user_info.user_name,
        need_to_set_user_name: selector_need_to_set_user_name(state),
        need_to_handle_password_recovery: state.user_info.need_to_handle_password_recovery,
    }
}

const map_dispatch = {
    set_user: ACTIONS.user_info.set_user,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps




function _UserAccountInfoForm (props: Props)
{
    const { user, user_name, need_to_set_user_name, need_to_handle_password_recovery, set_user } = props

    const [form_state, set_form_state] = useState<"initial" | "updating_password" | "updating_username">("initial")
    const [supabase_session_error, set_supabase_session_error] = useState<Error | null>(null)

    useEffect(() =>
    {
        if (need_to_set_user_name) set_form_state("updating_username")
    }, [need_to_set_user_name, form_state])


    if (!user) return null


    async function log_out ()
    {
        const supabase = get_supabase()

        const { error } = await supabase.auth.signOut()
        set_supabase_session_error(error)
        set_user({ user: supabase.auth.user() })
    }


    if (form_state === "updating_password" || need_to_handle_password_recovery)
    {
        return <UserAccountInfoChangePasswordForm on_close={() => set_form_state("initial")} />
    }


    if (form_state === "updating_username")
    {
        return <UserAccountInfoChangeUsernameForm on_close={() => set_form_state("initial")} />
    }


    return <div>
        <div className="section">
            Logged in with {user.email}<br />
            user id: &nbsp; {user.id}<br />
            <br />
            <input type="button" onClick={log_out} value="Log out" /><br />
            <br />
            <input type="button" onClick={() => set_form_state("updating_password")} value="Change password" /><br />
        </div>

        <div className="section">
            User name {user_name ? `: ${user_name}` : ""} <br />
            <input
                type="button"
                onClick={() => set_form_state("updating_username")}
                value={`${need_to_set_user_name ? "Set" : "Change"} username`}
            /><br />
        </div>

        <DisplaySupabaseSessionError error={supabase_session_error} />
    </div>
}

export const UserAccountInfoForm = connector(_UserAccountInfoForm) as FunctionalComponent<OwnProps>
