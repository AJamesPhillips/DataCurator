import PermDataSettingIcon from "@mui/icons-material/PermDataSetting"
import { Button, Typography } from "@mui/material"
import { FunctionalComponent } from "preact"
import { useEffect } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../../state/actions"
import type { RootState } from "../../state/State"
import {
    selector_chosen_base_name,
    selector_needs_to_create_a_base,
} from "../../state/user_info/selector"
import { SelectStorage } from "./SelectStorage"
import "./StorageInfo.scss"



const map_state = (state: RootState) =>
({
    base_name: selector_chosen_base_name(state),
    needs_to_create_a_base: selector_needs_to_create_a_base(state),
    display_select_storage: state.controls.display_select_storage,
})

const map_dispatch = {
    set_or_toggle_display_select_storage: ACTIONS.controls.set_or_toggle_display_select_storage,
}
const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _StorageInfo (props: Props)
{
    const {
        needs_to_create_a_base, display_select_storage,
        set_or_toggle_display_select_storage,
    } = props


    useEffect(() =>
    {
        if (needs_to_create_a_base) set_or_toggle_display_select_storage(true)
    }, [needs_to_create_a_base])


    return (
        <Typography component="span">
            <Button
                id="storage_info_button"
                color="primary"
                disableElevation={true}
                onClick={() => set_or_toggle_display_select_storage(true)}
                size="small"
                endIcon={<PermDataSettingIcon titleAccess="Create and Select Projects" />}
                style={{textTransform: "none"}}
                variant="contained"
            >
                <span class="storage_name">{props.base_name || "Choose store"}</span>
            </Button>
            {display_select_storage && <SelectStorage
                on_close={needs_to_create_a_base
                    ? undefined
                    : () => set_or_toggle_display_select_storage(false)
                }
            />}
        </Typography>
    )
}

export const StorageInfo = connector(_StorageInfo) as FunctionalComponent
