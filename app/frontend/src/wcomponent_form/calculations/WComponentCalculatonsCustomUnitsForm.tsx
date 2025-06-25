import { Delete as DeleteIcon } from "@mui/icons-material"
import { Box, IconButton } from "@mui/material"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ConfirmatoryButton } from "../../form/ConfirmatoryButton"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"
import { EditableTextOnBlurType } from "../../form/editable_text/editable_text_common"
import { Button } from "../../sharedf/Button"
import { ErrorOrWarningTriangleV2 } from "../../sharedf/WarningTriangleV2"
import type { RootState } from "../../state/State"
import { CalculationCustomUnit, WComponentCalculations } from "../../wcomponent/interfaces/wcomponent_base"



interface OwnProps
{
    wcomponent: Partial<WComponentCalculations>
    upsert_wcomponent: (partial_wcomponent: Partial<WComponentCalculations>) => void
}


const map_state = (state: RootState) =>
{
    return {
        editing: !state.display_options.consumption_formatting,
        wcomponents_by_id: state.derived.composed_wcomponents_by_id,
    }
}


const map_dispatch = {
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps


function _WComponentCalculatonsCustomUnitsForm (props: Props)
{
    const {
        editing,
        wcomponent,
    } = props

    const { calculation_custom_units = [] } = wcomponent

    const has_custom_units = calculation_custom_units.length > 0
    const [show_form, set_show_form] = useState(editing ? has_custom_units : false)
    if (!editing && !has_custom_units) return null

    let next_id = 0
    calculation_custom_units.forEach((custom_unit) => {
        if (custom_unit.id > next_id) next_id = custom_unit.id + 1
    })

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
                    Calculation Custom Units {(!show_form && calculation_custom_units.length) ? `(${calculation_custom_units.length})` : ""}
                </h4>
            </div>

            <div className="expansion_button"/>
        </div>


        {/* We could use <div className="details"> here but MUI is slow so want to minimise risk of it degrading performance, see #214 */}
        {show_form && <div>
            <Box display="flex" flexDirection="row" flexWrap="wrap" overflow="hidden">
                {calculation_custom_units.map((custom_unit, index) => <EditableCalculationCustomUnitsRow
                    key={custom_unit.id}
                    editing={editing}
                    custom_unit={custom_unit}
                    update_calculation_custom_units={modified_calculation_custom_unit =>
                    {
                        const modified_calculation_custom_units_with_nulls = [
                            ...calculation_custom_units.slice(0, index),
                            modified_calculation_custom_unit,
                            ...calculation_custom_units.slice(index + 1),
                        ]

                        const modified_calculation_custom_units = modified_calculation_custom_units_with_nulls.filter(calc => !!calc)

                        props.upsert_wcomponent({ calculation_custom_units: modified_calculation_custom_units })
                    }}
                />)}
            </Box>

            {editing && <Button
                value="Add custom unit"
                fullWidth={true}
                onClick={() =>
                {
                    const new_custom_unit: CalculationCustomUnit = {
                        id: next_id++,
                        name: "",
                        scale: 1,
                        target: "",
                    }
                    const modified_custom_units = [ ...calculation_custom_units, new_custom_unit ]
                    props.upsert_wcomponent({ calculation_custom_units: modified_custom_units })
                }}
            />}
        </div>}
    </div>
}

export const WComponentCalculatonsCustomUnitsForm = connector(_WComponentCalculatonsCustomUnitsForm)


interface EditableCalculationCustomUnitsRowProps
{
    editing: boolean
    custom_unit: CalculationCustomUnit
    update_calculation_custom_units: (modified_calculation_custom_unit: CalculationCustomUnit | null) => void
}
function EditableCalculationCustomUnitsRow (props: EditableCalculationCustomUnitsRowProps)
{
    const { editing, custom_unit } = props

    const [ready_to_delete, set_ready_to_delete] = useState(false)

    const is_error = custom_unit.name.trim().length === 0 || custom_unit.target.trim().length === 0
    const error_or_warning_message = is_error ? "Name and target must be set" : ""

    return <Box
        p={1}
        flexGrow={1}
        flexShrink={1}
        flexBasis="100%"
        maxWidth="100%"
        marginTop="5px"
        marginBottom={editing ? "18px" : undefined }
        flexDirection={editing ? "column" : "row"}
        style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", gap: "5px" }}
    >
        <ErrorOrWarningTriangleV2 message={error_or_warning_message} is_error={is_error} />

        {editing && <>
            <div style={{ width: "90%", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "10px" }}>
                <EditableTextSingleLine
                    size="small"
                    placeholder="Custom unit name"
                    value={custom_unit.name}
                    on_blur={name =>
                    {
                        props.update_calculation_custom_units({ ...custom_unit, name })
                    }}
                    on_blur_type={EditableTextOnBlurType.conditional}
                />

                <EditableTextSingleLine
                    size="small"
                    placeholder="Converts to"
                    value={custom_unit.target}
                    on_blur={target =>
                    {
                        props.update_calculation_custom_units({ ...custom_unit, target })
                    }}
                    on_blur_type={EditableTextOnBlurType.conditional}
                />

                {ready_to_delete && <ConfirmatoryButton
                    on_click={() =>
                    {
                        props.update_calculation_custom_units(null)
                    }}
                    button_text=""
                    button_icon={<DeleteIcon />}
                    ready_to_progress={true}
                    on_cancel={() => set_ready_to_delete(false)}
                />}
            </div>

            <div style={{ width: "10%", display: "flex" }}>
                {!ready_to_delete && <IconButton onClick={() => set_ready_to_delete(true)} size="large">
                    <DeleteIcon />
                </IconButton>}
            </div>
        </>}

        {!editing && <>
            <EditableTextSingleLine
                size="small"
                placeholder="Custom unit name"
                value={custom_unit.name || "..."}
            />

            <EditableTextSingleLine
                size="small"
                placeholder="Converts to"
                value={custom_unit.target || "..."}
            />
        </>}
    </Box>
}
