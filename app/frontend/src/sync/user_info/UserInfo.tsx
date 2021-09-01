import { getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { Box, Button, Typography } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../state/State"
import { finish_login } from "./solid/handle_login"
import { SelectSolidUser } from "./solid/SelectSolidUser"
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import GetAppIcon from '@material-ui/icons/GetApp';
const map_state = (state: RootState) =>
{
    return {
        storage_type: state.sync.storage_type,
        user_name: state.user_info.user_name,
    }
}

const map_dispatch = {}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _UserInfo (props: Props)
{
    const { storage_type, user_name } = props
    const [show_solid_signin_form, set_show_solid_signin_form] = useState(false)

    if (storage_type !== "solid") return null


    const solid_session = getDefaultSession()
    useEffect(() =>
    {
        finish_login()
        .then(() => set_show_solid_signin_form(!solid_session.info.isLoggedIn))
    }, [])


    const on_close = () =>
    {
        set_show_solid_signin_form(false)
    }

    return (
        <Button
            color="primary"
            endIcon={<ExitToAppIcon />}
            fullWidth={true}
            disableElevation={true}
            onClick={() => set_show_solid_signin_form(true)}
            size="small"
            style={{textTransform: 'none'}}
            variant="contained"
        >
            <Typography noWrap={true}>
                {user_name || (solid_session.info.isLoggedIn ? "(No user name)" : "Sign in")}
            </Typography>

            {show_solid_signin_form && <SelectSolidUser on_close={on_close} />}
        </Button>
    )
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
