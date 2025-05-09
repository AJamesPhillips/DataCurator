import { FunctionComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { EditableCheckbox } from "../form/EditableCheckbox"
import { WarningTriangleV2 } from "../sharedf/WarningTriangleV2"
import { ACTIONS } from "../state/actions"
import { RootState } from "../state/State"



const map_state = (state: RootState) => ({
    enable_angular_connections: state.display_options.enable_angular_connections,
})


const map_dispatch = {
    set_or_toggle_enable_angular_connections: ACTIONS.display.set_or_toggle_enable_angular_connections,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _ExperimentalFeatures(props: Props)
{
    return <>
        <b><ExperimentalWarning show_label={true} /></b>

        <p className="section">
            <ExperimentalWarning /> <b>
                {/* This is not a display option, it's an ability to edit data to be of this type  */}
                Enable Angular Connections&nbsp;
                <span style={{ position: "relative", top: "-0.5em" }}>
                    ⌞
                    <span style={{ position: "relative", top: "0.8em", left: "-2px" }}>
                        ⌝
                    </span>
                </span>
            </b>
            <EditableCheckbox
                value={props.enable_angular_connections}
                on_change={props.set_or_toggle_enable_angular_connections}
            />
        </p>
    </>
}

export const ExperimentalFeatures = connector(_ExperimentalFeatures) as FunctionComponent<{}>


function ExperimentalWarning (props: { show_label?: boolean })
{
    const msg = "Experimental feature.  Maybe changed or removed."

    return <WarningTriangleV2 warning={msg} label={props.show_label ? msg : ""} />
}
