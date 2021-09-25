import { Button, Typography } from "@material-ui/core"
import ExitToAppIcon from "@material-ui/icons/ExitToApp"
import type { User as SupabaseAuthUser } from "@supabase/supabase-js"
import { FunctionalComponent, h } from "preact"
import { useRef } from "preact/hooks"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../state/State"
import { selector_need_to_set_user_name } from "../../state/user_info/selector"
import { no_user_name } from "./constants"
import { UserAccountInfo } from "./UserAccountInfo"
import { UserSigninRegister } from "./UserSigninRegister"



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
type Props = ConnectedProps<typeof connector>


type FormState = "signin" | "hidden" | "account_info"


function _UserInfo (props: Props)
{
    const { user, user_name, need_to_set_user_name } = props
    const [form_state, set_form_state] = useState<FormState>("hidden")
    const previous_user = useRef<SupabaseAuthUser | null>(user)
    const user_name_or_none = user_name || no_user_name


    useEffect(() =>
    {
        const previous_signed_out = !previous_user.current && user
        previous_user.current = user

        const new_form_state: FormState = !user ? "signin" : (need_to_set_user_name ? "account_info" : (previous_signed_out ?"hidden" : form_state))
        set_form_state(new_form_state)
    }, [user, need_to_set_user_name])


    return (<div>
        <Button
            color="primary"
            endIcon={<ExitToAppIcon />}
            fullWidth={true}
            disableElevation={true}
            // disabled={form_state === "signin"} // do not mark as disabled as the modal will prevent user
            // interaction anyway and if disabled is used then modal and buttons on it become disabled too.
            onClick={() => set_form_state("account_info")}
            size="small"
            style={{textTransform: "none"}}
            variant="contained"
        >
            <Typography noWrap={true}>
                {user ? user_name_or_none : "Sign in"}
            </Typography>
        </Button>

        {form_state === "signin" && <UserSigninRegister
            on_close={(!user) ? undefined : () => set_form_state("hidden")} />}

        {form_state === "account_info" && <UserAccountInfo
            on_close={need_to_set_user_name ? undefined : () => set_form_state("hidden")}
        />}
    </div>)
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
