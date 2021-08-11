import { Box } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { sentence_case } from "../shared/utils/sentence_case"
import type { RootState } from "../state/State"
import { SelectStorageType } from "./SelectStorageType"



const map_state = (state: RootState) =>
{
    return {
        storage_type: state.sync.storage_type,
    }
}

const map_dispatch = {}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _StorageInfo (props: Props)
{
    const { storage_type } = props

    const [show_select_storage, set_show_select_storage] = useState(storage_type === undefined)


    return <Box
        style={{ cursor: "pointer" }}
        onClick={() => set_show_select_storage(true)}
    >
        &nbsp;
        {sentence_case((storage_type || "None").replaceAll("_", " "))}

        {show_select_storage && <SelectStorageType on_close={e =>
            {
                e && e.stopImmediatePropagation()
                set_show_select_storage(false)
            }} />}
    </Box>
}

export const StorageInfo = connector(_StorageInfo) as FunctionalComponent<{}>
