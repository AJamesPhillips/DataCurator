import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { sentence_case } from "../shared/utils/sentence_case"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
{
    return {
        storage_type: state.sync.storage_type,
    }
}

const map_dispatch = {}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _UserInfo (props: Props)
{
    const { storage_type } = props

    if (!storage_type) return <div></div> // <SelectStorageType />

    return <Box>
        &nbsp;
        {sentence_case(storage_type.replaceAll("_", " "))}
    </Box>
}

export const UserInfo = connector(_UserInfo) as FunctionalComponent<{}>
