import { Button, Typography } from "@material-ui/core"
import ExitToAppIcon from "@material-ui/icons/ExitToApp"
import { FunctionalComponent, h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../state/State"
import { no_user_name } from "./constants"
import { UserAccountInfo } from "./UserAccountInfo"
import { UserSigninRegister } from "./UserSigninRegister"



const map_state = (state: RootState) =>
{
    return {
        user: state.user_info.user,
        user_name: state.user_info.user_name,
    }
}

const map_dispatch = {}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


type FormState = "signin" | "hidden" | "account_info"


function _UserInfo (props: Props)
{
    const { user, user_name } = props
    const [form_state, set_form_state] = useState<FormState>("hidden")
    const user_name_or_none = user_name || no_user_name


    useEffect(() =>
    {
        set_form_state(!user ? "signin" : "hidden")
    }, [user])


    return (
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
                {user
                    ? user_name_or_none
                    : "Sign in" + (user_name && ` as ${user_name}`)
                }
            </Typography>

            {form_state === "signin" && <UserSigninRegister />}
            {form_state === "account_info" && <UserAccountInfo on_close={() => set_form_state("hidden")} />}
        </Button>
    )
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
