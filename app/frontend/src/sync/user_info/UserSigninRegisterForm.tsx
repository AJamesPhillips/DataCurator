import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import "../common.scss"
import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import { get_supabase } from "../../supabase/get_supabase"
import { DisplaySupabaseSessionError } from "./DisplaySupabaseErrors"



interface OwnProps {
    on_close?: () => void
}


const map_state = (state: RootState) =>
{
    return {}
}

const map_dispatch = {
    set_user: ACTIONS.user_info.set_user,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



type SigninRegisterFormState = "initial" | "registered" | "reset_password"


function _UserSigninRegisterForm (props: Props)
{
    const { set_user } = props

    const supabase = get_supabase()

    const [form_state, set_form_state] = useState<SigninRegisterFormState>("initial")
    const [email, set_email] = useState("")
    const [password, set_password] = useState("")
    const [supabase_session_error, set_supabase_session_error] = useState<Error | null>(null)



    async function register ()
    {
        const { user: new_user, error } = await supabase.auth.signUp({ email, password })

        set_supabase_session_error(error)
        if (!error) set_form_state("registered")
    }


    async function sign_in ()
    {
        const { user, error } = await supabase.auth.signIn({ email, password })

        set_supabase_session_error(error)
        set_user({ user })
    }


    async function forgot_password ()
    {
        const { data, error } = await supabase.auth.api.resetPasswordForEmail(email)

        set_supabase_session_error(error)
        if (!error) set_form_state("reset_password")
    }


    if (form_state === "initial") return <div className="section">
        <form>
            <input type="email" placeholder="email" value={email}
                onKeyUp={e => set_email(e.currentTarget.value)}
                onChange={e => set_email(e.currentTarget.value)}
                onBlur={e => set_email(e.currentTarget.value)}
            /><br/>
            <input type="password" placeholder="password" value={password}
                onKeyUp={e => set_password(e.currentTarget.value)}
                onChange={e => set_password(e.currentTarget.value)}
                onBlur={e => set_password(e.currentTarget.value)}
            /><br/>
        </form>

        <div>
            <input type="button" disabled={!email || !password} onClick={sign_in} value="Signin" />
            <input type="button" disabled={!email || !password} onClick={register} value="Register" /><br/>
            <input type="button" disabled={!email} onClick={forgot_password} value="Forgot password?" /><br/>
        </div>

        <DisplaySupabaseSessionError error={supabase_session_error} />
    </div>


    else if (form_state === "reset_password") return <div className="section">
        <h3>Password reset</h3>
        <br/>
        {!supabase_session_error && "Please check your email"}
        <DisplaySupabaseSessionError error={supabase_session_error} />
    </div>


    else /* if (form_state === "registered") */ return <div className="section">
        <h3>Registered</h3>
        <br/>
        Please check your email
    </div>
}

export const UserSigninRegisterForm = connector(_UserSigninRegisterForm) as FunctionalComponent<OwnProps>
