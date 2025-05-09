/* eslint-disable @typescript-eslint/no-misused-promises */
import type { AuthError } from "@supabase/supabase-js"
import { FunctionalComponent } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../../state/actions"
import { get_supabase } from "../../supabase/get_supabase"
import "../common.scss"
import { DisplaySupabaseSessionError } from "./DisplaySupabaseErrors"
import "./UserSigninRegisterForm.scss"



const map_dispatch = {
    set_user: ACTIONS.user_info.set_user,
}


const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector>



type SigninRegisterFormState = "initial" | "registered" | "reset_password"


function _UserSigninRegisterForm (props: Props)
{
    const { set_user } = props

    const supabase = get_supabase()

    const [form_state, set_form_state] = useState<SigninRegisterFormState>("initial")
    const [email, _set_email] = useState("")
    const [password, _set_password] = useState("")
    const [supabase_session_error, set_supabase_session_error] = useState<AuthError | null>(null)

    const [user_needs_to_provide_email, set_user_needs_to_provide_email] = useState(false)
    const [user_needs_to_provide_password, set_user_needs_to_provide_password] = useState(false)

    // console .log("UserSigninRegisterForm", form_state, email, password, supabase_session_error, user_needs_to_provide_email, user_needs_to_provide_password)

    function set_email (new_email: string)
    {
        _set_email(new_email)
        set_user_needs_to_provide_email(false)
    }

    function set_password (new_password: string)
    {
        _set_password(new_password)
        set_user_needs_to_provide_password(false)
    }


    async function register ()
    {
        if (!email || !password)
        {
            if (!email) set_user_needs_to_provide_email(true)
            if (!password) set_user_needs_to_provide_password(true)
            return
        }

        const { error } = await supabase.auth.signUp(
            {
                email,
                password,
                // options: { emailRedirectTo: "http://localhost:8080/app/" }
                options: { emailRedirectTo: "https://datacurator.org/app/" }
            },
        )

        set_supabase_session_error(error)
        if (!error) set_form_state("registered")
    }


    async function sign_in ()
    {
        if (!email || !password)
        {
            if (!email) set_user_needs_to_provide_email(true)
            if (!password) set_user_needs_to_provide_password(true)
            return
        }

        const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password })
        set_supabase_session_error(error)
        set_user({ user: user || undefined })
    }


    async function forgot_password ()
    {
        if (!email)
        {
            set_user_needs_to_provide_email(true)
            set_user_needs_to_provide_password(false)
            return
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email)

        set_supabase_session_error(error)
        if (!error) set_form_state("reset_password")
    }


    if (form_state === "initial") return <div className="section">
        <form>
            <br/><br/>
            <input type="email" placeholder="email" value={email}
                onKeyUp={e => set_email(e.currentTarget.value)}
                onChange={e => set_email(e.currentTarget.value)}
                onBlur={e => set_email(e.currentTarget.value)}
            />
            <div className={"error_form_input_empty " + (user_needs_to_provide_email ? "" : "inactive")}>
                Email required
            </div>

            <br/>

            <input type="password" placeholder="password" value={password}
                onKeyUp={e => set_password(e.currentTarget.value)}
                onChange={e => set_password(e.currentTarget.value)}
                onBlur={e => set_password(e.currentTarget.value)}
            />
            <div className={"error_form_input_empty " + (user_needs_to_provide_password ? "" : "inactive")}>
                Password required
            </div>
        </form>

        <div>
            <br/>
            <input type="button" onClick={sign_in} value="Signin" /> &nbsp;
            <input type="button" onClick={register} value="Register" /><br/>
            <br/>
            <input type="button" onClick={forgot_password} value="Forgot password?" /><br/>
            <br/>
        </div>

        <DisplaySupabaseSessionError error={supabase_session_error} />
        <br/>
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

export const UserSigninRegisterForm = connector(_UserSigninRegisterForm) as FunctionalComponent
