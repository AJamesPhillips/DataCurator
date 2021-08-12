import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../state/State"



const map_state = (state: RootState) =>
{
    return {
        storage_type: state.sync.storage_type,
        solid_oidc_provider: state.user_info.solid_oidc_provider,
    }
}

const map_dispatch = {}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _UserInfo (props: Props)
{
    const { storage_type, solid_oidc_provider } = props

    if (storage_type !== "solid") return null


    return <Box>
        &nbsp;
        {!solid_oidc_provider && <div>Show me</div>}
    </Box>
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
