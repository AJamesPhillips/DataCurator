import { Box, Button, Typography } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../state/State"
import { SelectStorageType } from "./SelectStorageType"
import { get_storage_type_name } from "./get_storage_type_name"
import PermDataSettingIcon from '@material-ui/icons/PermDataSetting';

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
                {get_storage_type_name(storage_type)}
            </Button>
            {show_select_storage && <SelectStorageType on_close={() => set_show_select_storage(false)} />}
        </Typography>
    )
}

export const StorageInfo = connector(_StorageInfo) as FunctionalComponent<{}>
