import { Button, Typography } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { useEffect, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import PermDataSettingIcon from "@material-ui/icons/PermDataSetting"

import "./StorageInfo.scss"
import type { RootState } from "../../state/State"
import { SelectStorage } from "./SelectStorage"
import {
    selector_chosen_base_name,
    selector_needs_to_create_a_base,
} from "../../state/user_info/selector"



const map_state = (state: RootState) =>
({
    base_name: selector_chosen_base_name(state),
    needs_to_create_a_base: selector_needs_to_create_a_base(state),
})

const map_dispatch = {}
const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _StorageInfo (props: Props)
{
    const { needs_to_create_a_base } = props

    const [show_select_storage, set_show_select_storage] = useState(false)


    useEffect(() =>
    {
        if (needs_to_create_a_base) set_show_select_storage(true)
    }, [needs_to_create_a_base])


    return (
        <Typography component="span">
            <Button
                id="storage_info_button"
                color="primary"
                disableElevation={true}
                onClick={() => set_show_select_storage(true)}
                size="small"
                endIcon={<PermDataSettingIcon titleAccess="Create and Select Knowledge Bases" />}
                style={{textTransform: 'none'}}
                variant="contained"
            >
                <span class="storage_name">{props.base_name || "Choose store"}</span>
            </Button>
            {show_select_storage && <SelectStorage
                on_close={needs_to_create_a_base ? undefined : () => set_show_select_storage(false)}
            />}
        </Typography>
    )
}

export const StorageInfo = connector(_StorageInfo) as FunctionalComponent<{}>
