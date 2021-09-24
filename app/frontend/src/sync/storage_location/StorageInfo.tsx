import { Button, Typography } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import PermDataSettingIcon from '@material-ui/icons/PermDataSetting'

import "./StorageInfo.scss"
import type { RootState } from "../../state/State"
import { SelectStorage } from "./SelectStorage"
import { selector_storage_name } from "../../state/user_info/selector"



const map_state = (state: RootState) =>
{
    const base_name = selector_storage_name(state)

    return {
        base_name,
    }
}

const map_dispatch = {}
const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _StorageInfo (props: Props)
{
    const [show_select_storage, set_show_select_storage] = useState(false)

    return (
        <Typography component="span">
            <Button
                color="primary"
                disableElevation={true}
                onClick={() => set_show_select_storage(true)}
                size="small"
                endIcon={<PermDataSettingIcon titleAccess="Set Data Storage Location" />}
                style={{textTransform: 'none'}}
                variant="contained"
            >
                <span class="storage_name">{props.base_name || "Choose store"}</span>
            </Button>
            {show_select_storage && <SelectStorage on_close={() => set_show_select_storage(false)} />}
        </Typography>
    )
}

export const StorageInfo = connector(_StorageInfo) as FunctionalComponent<{}>
