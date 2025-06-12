import { EditableCheckbox } from "../form/EditableCheckbox"
import { WarningTriangleV2 } from "../sharedf/WarningTriangleV2"
import { experimental_features } from "../state/display_options/persistance"



export function ExperimentalFeatures()
{
    const state = experimental_features.get_state()

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
                value={state.enable_angular_connections}
                on_change={value =>
                {
                    experimental_features.set_state_and_reload_page({
                        enable_angular_connections: value,
                    })
                }}
            />
        </p>

        <p className="section">
            <ExperimentalWarning /> <b>Enable actions kanban view</b>
            <EditableCheckbox
                value={state.enable_action_kanban_view}
                on_change={value =>
                {
                    experimental_features.set_state_and_reload_page({
                        enable_action_kanban_view: value,
                    })
                }}
            />
        </p>

        <div className="section">
            <ExperimentalWarning /> <b>Enable aligning components by time on x-axis</b>
            <EditableCheckbox
                value={state.enable_align_components_on_x_by_time}
                on_change={value =>
                {
                    experimental_features.set_state_and_reload_page({
                        enable_align_components_on_x_by_time: value,
                    })
                }}
            />
        </div>
    </>
}


function ExperimentalWarning (props: { show_label?: boolean })
{
    const msg = "Experimental feature.  May be changed or removed in the future.  Toggling an experimental feature on or off will reload the page."

    return <WarningTriangleV2 warning={msg} label={props.show_label ? msg : ""} />
}
