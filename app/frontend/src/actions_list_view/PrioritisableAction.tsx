import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import { IconButton } from "@mui/material"
import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import type { WComponentNodeAction } from "../wcomponent/interfaces/action"
import { WComponentCanvasNode } from "../wcomponent_canvas/node/WComponentCanvasNode"
import "./PrioritisableAction.scss"



interface OwnProps
{
    action: WComponentNodeAction
    show_icebox_actions?: boolean
    show_todo_actions?: boolean
}



const map_state = (state: RootState) => ({
    editing: !state.display_options.consumption_formatting,
})


const map_dispatch = {
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps




function _PrioritisableAction (props: Props)
{
    const { action, upsert_wcomponent } = props

    return <div className="prioritisable_action">
        <WComponentCanvasNode id={action.id} is_on_canvas={false} always_show={true} />


        {props.show_icebox_actions && <div className="controls">
            <IconButton
                size="medium"
                onClick={() => upsert_wcomponent({
                    wcomponent: { ...action, todo_index: new Date().getTime() }
                })}
            >
                <ArrowForwardIcon />
            </IconButton>
        </div>}

        {props.show_todo_actions && <div className="controls">
            <IconButton
                size="medium"
                onClick={() => upsert_wcomponent({
                    wcomponent: { ...action, todo_index: new Date().getTime() }
                })}
            >
                <ArrowUpwardIcon />
            </IconButton>

            <IconButton
                size="medium"
                onClick={() => upsert_wcomponent({
                    wcomponent: { ...action, todo_index: undefined }
                })}
            >
                <ArrowBackIcon />
            </IconButton>

            {/* <IconButton
                size="medium"
                onClick={() => upsert_wcomponent({
                    wcomponent: { ...action, todo_index: new Date().getTime() }
                })}
            >
                <ArrowDownwardIcon />
            </IconButton> */}
        </div>}
    </div>
}

export const PrioritisableAction = connector(_PrioritisableAction) as FunctionalComponent<OwnProps>
