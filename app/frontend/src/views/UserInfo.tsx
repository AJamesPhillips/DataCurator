import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { sentence_case } from "../shared/utils/sentence_case"

import type { RootState } from "../state/State"
import { STORAGE_TYPE } from "../state/sync_utils/supported_keys"



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
        &nbsp;
        {sentence_case(STORAGE_TYPE.replaceAll("_", " "))}
    </Box>
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
