import EditIcon from "@mui/icons-material/Edit"
import PresentToAllIcon from "@mui/icons-material/PresentToAll"
import { ButtonGroup, IconButton, Tooltip } from "@mui/material"
import { FunctionalComponent } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { selector_current_user_access_level } from "../state/user_info/selector"
import { invert_disabled_appearance } from "../ui_themes/invert_disabled"



const map_state = (state: RootState) =>
{
    const access_level = selector_current_user_access_level(state)

    return {
        presenting: state.display_options.consumption_formatting,
        access_level,
    }
}

const map_dispatch = {
    toggle_consumption_formatting: ACTIONS.display.toggle_consumption_formatting,
    change_route: ACTIONS.routing.change_route,
}
const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _ViewOptions (props: Props)
{
    const { access_level } = props
    const can_not_edit = access_level === "viewer" || access_level === "none"
    const are_in_edit_mode = !props.presenting

    const [present_warning, set_present_warning] = useState<boolean | undefined>(undefined)
    const presented_warning_once = useRef(false)


    useEffect(() =>
    {
        if (access_level === undefined) return
        if (presented_warning_once.current) return
        presented_warning_once.current = true

        set_present_warning(can_not_edit)
    }, [access_level])

    const button_edit_title = can_not_edit ? "No editing rights" : ""
    const button_edit_color = can_not_edit ? (props.presenting ? "rgba(183, 28, 26, 0.5)" : "rgba(183, 28, 26)") : ""

    const classes = invert_disabled_appearance()


    return (
        <ButtonGroup
            size="small"
            value={props.presenting ? "presenting" : "editing"}
        >
            <Tooltip title={button_edit_title} aria-label={button_edit_title}>
                <IconButton
                    className={classes.inverse_disabled}
                    disabled={are_in_edit_mode}
                    // `component` is a workaround to get tooltip to work when button is disabled
                    // https://stackoverflow.com/a/63276424/539490
                    component={are_in_edit_mode ? "div" : undefined}
                    onClick={are_in_edit_mode ? undefined : props.toggle_consumption_formatting}
                    value="editing"
                    size="large">
                    <EditIcon style={{ color: button_edit_color }} />
                </IconButton>
            </Tooltip>
            <IconButton
                className={classes.inverse_disabled}
                disabled={props.presenting}
                onClick={props.toggle_consumption_formatting}
                value="presenting"
                size="large">
                <PresentToAllIcon />
            </IconButton>

            {/* {are_in_edit_mode && present_warning && <Modal
                title=""
                size="small"
                scrollable={false}
                on_close={() => set_present_warning(false)}
                child={<div style={{ margin: "30px" }}>
                    <h1>Warning: Your edits will not be saved</h1>

                    <p>
                        You can make changes to this knowledge base but they will not be saved.
                        The owner of this knowledge base may give you editing rights if you ask them.
                    </p>

                    <br />

                    <p style={{ textAlign: "center" }}>
                        <Button onClick={() => set_present_warning(false)}>Ok</Button>
                    </p>
                </div>}
            />} */}
        </ButtonGroup>
    )
}

export const ViewOptions = connector(_ViewOptions) as FunctionalComponent<{}>
