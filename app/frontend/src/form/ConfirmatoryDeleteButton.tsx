import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import DeleteIcon from "@mui/icons-material/Delete"

import type { RootState } from "../state/State"
import { ConfirmatoryButton } from "./ConfirmatoryButton"



interface OwnProps
{
    disabled?: boolean
    on_delete?: () => void,
    button_text?: string
    tooltip_text?: string
}


const map_state = (state: RootState) => ({
    consumption_formatting: state.display_options.consumption_formatting,
})

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


function _ConfirmatoryDeleteButton (props: Props)
{
    if (props.consumption_formatting) return null

    return <ConfirmatoryButton
        disabled={props.disabled}
        on_click={props.on_delete}
        button_text={props.button_text ?? "Delete"}
        button_icon={<DeleteIcon />}
        tooltip_text={props.tooltip_text}
    />
}

export const ConfirmatoryDeleteButton = connector(_ConfirmatoryDeleteButton) as FunctionalComponent<OwnProps>
