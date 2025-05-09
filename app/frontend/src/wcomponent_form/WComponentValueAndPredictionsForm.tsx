import { Settings as SettingsIcon } from "@mui/icons-material"
import { IconButton } from "@mui/material"
import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { useState } from "preact/hooks"
import { EditableTextSingleLine } from "../form/editable_text/EditableTextSingleLine"
import { EditableTextOnBlurType } from "../form/editable_text/editable_text_common"
import { RootState } from "../state/State"
import { wcomponent_is_statev2, WComponentIsAllowedToHaveStateVAPSets } from "../wcomponent/interfaces/SpecialisedObjects"
import { VAPsType } from "../wcomponent/interfaces/VAPsType"
import { ValuePossibilitiesById } from "../wcomponent/interfaces/possibility"
import { StateValueAndPredictionsSet } from "../wcomponent/interfaces/state"
import { EasyActionValueAndPredictionSets } from "./values_and_predictions/EasyActionValueAndPredictionSets"
import { ValueAndPredictionSets } from "./values_and_predictions/ValueAndPredictionSets"



interface OwnProps
{
    editing_allowed: boolean
    wcomponent: WComponentIsAllowedToHaveStateVAPSets
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentIsAllowedToHaveStateVAPSets>) => void
    VAPs_represent: VAPsType
    orig_values_and_prediction_sets: StateValueAndPredictionsSet[]
    orig_value_possibilities: ValuePossibilitiesById | undefined
}


const map_state = (state: RootState) =>
{
    return {
        wcomponents_by_id: state.derived.composed_wcomponents_by_id,
        presenting: state.display_options.consumption_formatting,
    }
}


const map_dispatch = {
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentValueAndPredictionsForm (props: Props)
{
    const {
        editing_allowed,
        wcomponent,
        upsert_wcomponent,
        VAPs_represent,
        orig_values_and_prediction_sets,
        orig_value_possibilities,
    } = props

    const initial_show_form = (
        orig_values_and_prediction_sets.length > 0
        // Show form if editing allowed and VAPs represent actions
        || (editing_allowed && VAPs_represent === VAPsType.action)
    )
    const [show_form, set_show_form] = useState(initial_show_form)

    const units = wcomponent_is_statev2(wcomponent) && wcomponent.units
    const [show_options, set_show_options] = useState(!!units)

    const show_units = (
           (show_options &&    (VAPs_represent === VAPsType.number || !!units))
        || (props.presenting && VAPs_represent === VAPsType.number && !!units)
    )

    // Note: I do not think `editable_list_entry` makes semantic sense here. We're
    // only using it to get the CSS styles applied for `expansion_button`.
    return <div className={"editable_list_entry padded " + (show_form ? "expanded" : "")}>
        <div
            className="summary_header"
            style={{ cursor: "pointer" }}
            onClick={() => set_show_form(!show_form)}
        >
            <div className="summary">
                <h4 style={{ display: "inline-block" }}>
                    Value Predictions {(!show_form && orig_values_and_prediction_sets.length) ? `(${orig_values_and_prediction_sets.length})` : ""}
                </h4>
                {/* <div style={{ display: "inline-block", position: "relative", top: 7, left: 5 }}>
                    <WarningTriangleV2 warning={""} label="" />
                </div> */}
            </div>

            <div className="expansion_button"/>
        </div>

        {wcomponent_is_statev2(wcomponent) && <div>
            {props.editing_allowed && <IconButton
                onClick={() => set_show_options(!show_options)}
                size="small"
                style={{ marginLeft: "auto", display: "flex" }}
            >
                <SettingsIcon />
            </IconButton>}

            {show_units && <EditableTextSingleLine
                style={{ padding: "10px 0px" }}
                size="small"
                placeholder="Units"
                hide_label={false}
                disabled={!props.editing_allowed}
                value={wcomponent.units || ""}
                on_blur={units => props.upsert_wcomponent({ units: units || undefined })}
                on_blur_type={EditableTextOnBlurType.conditional}
            />}
        </div>}


        {/* We could use <div className="details"> here but MUI is slow so want to minimise risks, see #214 */}
        {show_form && <div>
            {VAPs_represent === VAPsType.undefined && <div>
                {wcomponent.type === "state_value"
                    ? "Set subtype of target 'state' component to show Value Predictions on this 'state value' component"
                    : "Set subtype to show Value Predictions"
                }
            </div>}
            {VAPs_represent === VAPsType.action && <EasyActionValueAndPredictionSets
                VAPs_represent={VAPs_represent}
                base_id={wcomponent.base_id}
                existing_value_possibilities={orig_value_possibilities}
                values_and_prediction_sets={orig_values_and_prediction_sets}
                update_VAPSets_and_value_possibilities={({ value_possibilities, values_and_prediction_sets }) =>
                {
                    upsert_wcomponent({ value_possibilities, values_and_prediction_sets })
                }}
                editing_allowed={editing_allowed}
            />}
            {VAPs_represent !== VAPsType.undefined && <ValueAndPredictionSets
                wcomponent_id={wcomponent.id}
                VAPs_represent={VAPs_represent}
                existing_value_possibilities={orig_value_possibilities}
                values_and_prediction_sets={orig_values_and_prediction_sets}
                update_VAPSets_and_value_possibilities={({ value_possibilities, values_and_prediction_sets }) =>
                {
                    upsert_wcomponent({ value_possibilities, values_and_prediction_sets })
                }}
                editing_allowed={editing_allowed}
            />}
        </div>}
    </div>
}

export const WComponentValueAndPredictionsForm = connector(_WComponentValueAndPredictionsForm) as FunctionalComponent<OwnProps>
