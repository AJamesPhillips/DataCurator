import { FunctionalComponent, h, Ref } from "preact"

import "./Editable.css"
import { useState } from "preact/hooks"
import { date2str, get_today_str } from "../shared/utils/date_helpers"
import { connect, ConnectedProps } from "react-redux"
import type { RootState } from "../state/State"
import { Box, IconButton, TextField } from "@material-ui/core"
import FileCopyIcon from '@material-ui/icons/FileCopy';

interface OwnProps
{
    title?: string
    value?: Date | undefined
    on_change?: (new_datetime: Date | undefined) => void
    always_allow_editing?: boolean
}

const map_state = (state: RootState) => ({
    time_resolution: state.display_options.time_resolution,
    presenting: state.display_options.consumption_formatting,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps

function _MaterialDateTime (props: Props)
{
    const not_editable = props.always_allow_editing ? false : props.presenting
    return (
        <Box>
            <TextField
                label={props.title || null}
                value={(props?.value) ? date2str(props.value, "yyyy-MM-ddThh:mm") : null}
                disabled={not_editable}
                size="small"
                type="datetime-local"
                variant="outlined"
                onChange={(e:any) => {
                    if (props.on_change) props.on_change(new Date(e.target.value))
                }}
            />
            {/* <IconButton>
                <FileCopyIcon />
            </IconButton> */}
        </Box>
    )
}

export const MaterialDateTime = connector(_MaterialDateTime) as FunctionalComponent<OwnProps>
