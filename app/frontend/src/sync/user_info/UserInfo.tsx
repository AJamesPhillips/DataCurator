import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { Button, Typography } from "@mui/material"
import type { AuthUser as SupabaseAuthUser } from "@supabase/supabase-js"
import { FunctionalComponent } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../state/State"
import { selector_need_to_set_user_name, selector_user_name } from "../../state/user_info/selector"
import { no_user_name } from "./constants"
import { UserAccountInfo } from "./UserAccountInfo"
import { UserSigninRegister } from "./UserSigninRegister"



const map_state = (state: RootState) =>
{
    return {
        user: state.user_info.user,
        bases_by_id: state.user_info.bases_by_id,
        users_by_id: state.user_info.users_by_id,
        chosen_base_id: state.user_info.chosen_base_id,
        user_name: selector_user_name(state),
        need_to_set_user_name: selector_need_to_set_user_name(state),
    }
}

const map_dispatch = {}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


type FormState = "signin" | "loading" | "hidden" | "account_info"


function _UserInfo (props: Props)
{
    const { user, bases_by_id, users_by_id, chosen_base_id, user_name, need_to_set_user_name } = props
    const is_loading_users = !users_by_id
    const [form_state, set_form_state] = useState<FormState>("hidden")
    const previous_user = useRef<SupabaseAuthUser | undefined>(user)
    const user_name_or_none = user_name || no_user_name


    useEffect(() =>
    {
        const previous_signed_out = !previous_user.current && user
        previous_user.current = user

        const have_bases_but_base_id_not_present = (bases_by_id && chosen_base_id) ? !bases_by_id[chosen_base_id] : false

        const should_sign_in = !user && have_bases_but_base_id_not_present

        const new_form_state: FormState = should_sign_in ? "signin"
            : (is_loading_users ? "loading"
            : (need_to_set_user_name ? "account_info"
            : (previous_signed_out ? "hidden" : form_state)))

        // console .log("new_form_state ", form_state, "->", new_form_state, "is_loading_users", is_loading_users, "need_to_set_user_name", need_to_set_user_name)

        set_form_state(new_form_state)

    }, [user, bases_by_id, chosen_base_id, is_loading_users, need_to_set_user_name])


    return (<div>
        <Button
            color="primary"
            endIcon={<AccountCircleIcon />}
            fullWidth={true}
            disableElevation={true}
            // disabled={form_state === "signin"} // do not mark as disabled as the modal will prevent user
            // interaction anyway and if disabled is used then modal and buttons on it become disabled too.
            onClick={() => set_form_state(user ? "account_info" : "signin")}
            size="small"
            style={{textTransform: "none"}}
            variant="contained"
        >
            <Typography noWrap={true}>
                {user ? user_name_or_none : (is_loading_users ? "Loading" : "Sign in")}
            </Typography>
        </Button>

        {form_state === "signin" && <UserSigninRegister
            on_close={() => set_form_state("hidden")}
        />}

        {form_state === "account_info" && <UserAccountInfo
            on_close={need_to_set_user_name ? undefined : () => set_form_state("hidden")}
        />}
    </div>)
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
