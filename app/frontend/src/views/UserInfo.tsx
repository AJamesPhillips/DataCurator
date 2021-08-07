import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
{
    return {}
}

const map_dispatch = {}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _UserInfo (props: Props)
{
    return <Box>
        LocalStorage
    </Box>
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
