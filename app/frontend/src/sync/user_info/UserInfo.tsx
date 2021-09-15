import { getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { Button, Typography } from "@material-ui/core"
import ExitToAppIcon from "@material-ui/icons/ExitToApp"
import { FunctionalComponent, h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { ERRORS } from "../../shared/errors"

import type { RootState } from "../../state/State"
import { finish_login } from "./solid/handle_login"
import { UserAccountInfo } from "./solid/UserAccountInfo"



const map_state = (state: RootState) =>
{
    return {
        storage_type: state.sync.storage_type,
        user_name: state.user_info.user_name,
        using_solid: state.sync.use_solid_storage,
    }
}

const map_dispatch = {}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _UserInfo (props: Props)
{
    const { storage_type, user_name, using_solid } = props
    const [show_solid_signin_form, set_show_solid_signin_form] = useState(false)


    const solid_session = getDefaultSession()
    useEffect(() =>
    {
        if (storage_type !== "solid") return

        finish_login()
        .then(() => set_show_solid_signin_form(!solid_session.info.isLoggedIn))
        .catch(err => console.error("UserInfo finish_login got error: ", err))
    }, [storage_type])


    const on_close = () =>
    {
        set_show_solid_signin_form(false)
    }


    const user_name_or_none = user_name || "(No user name)"


    return (
        <Button
            color="primary"
            endIcon={<ExitToAppIcon />}
            fullWidth={true}
            disableElevation={true}
            onClick={() => set_show_solid_signin_form(true)}
            size="small"
            style={{textTransform: "none"}}
            variant="contained"
        >
            <Typography noWrap={true}>
                {solid_session.info.isLoggedIn
                    ? user_name_or_none
                    : (using_solid ? "Sign in" + (user_name && ` as ${user_name}`) : user_name_or_none)
                }
            </Typography>

            {show_solid_signin_form && <UserAccountInfo on_close={on_close} />}
        </Button>
    )
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
