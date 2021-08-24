import { getDefaultSession } from "@inrupt/solid-client-authn-browser"
import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../state/State"
import { finish_login } from "./solid/handle_login"
import { SelectSolidUser } from "./solid/SelectSolidUser"



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


    return <Box>
        &nbsp;
        <span
            onClick={() => set_show_solid_signin_form(true)}
            style={{ cursor: "pointer" }}
        >
            {user_name || "Sign in"}
        </span>
        {show_solid_signin_form && <SelectSolidUser on_close={on_close} />}
    </Box>
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
