import { getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { Box, Button } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useEffect } from "preact/hooks"
import { useState } from "preact/hooks"
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
        finish_login(solid_session)
        .then(() => set_show_solid_signin_form(!solid_session.info.isLoggedIn))
    }, [])


    const on_close = () =>
    {
        set_show_solid_signin_form(false)
    }

    return <Box display="flex" height={1} alignItems="center">
        <Button
            disableElevation={true}
            variant="contained"
            color="primary"
            endIcon={<ExitToAppIcon />}
            onClick={() => set_show_solid_signin_form(true)}
        >
            {user_name || "Sign in"}
            {show_solid_signin_form && <SelectSolidUser on_close={on_close} />}
        </Button>
    </Box>
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
