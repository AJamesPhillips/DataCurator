import { Box, IconButton } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"

import { CalculationResult, PlainCalculationObject } from "../../calculations/interfaces"
import { WarningTriangle } from "../../sharedf/WarningTriangle"
import { WarningTriangleV2 } from "../../sharedf/WarningTriangleV2"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"
import { useState } from "preact/hooks"
import { EditableTextOnBlurType } from "../../form/editable_text/editable_text_common"
import { NumberDisplayType, format_number_to_string } from "../../shared/format_number_to_string"
import { prepare_result_units_for_display } from "../../calculations/prepare_result_units_for_display"



export interface CalculationRowProps
{
    editing: boolean
    calculation: PlainCalculationObject
    index: number
    calculation_results: CalculationResult[]
    update_calculation: (calculation: PlainCalculationObject | null) => void
}

export function EditableCalculationRow (props: CalculationRowProps)
{
    const { calculation: calc, index, calculation_results: results, editing } = props

    const result = results[index]

    let output_element = <span />
    if (result !== undefined && result.value !== undefined) // && values_different(calc.value, result.value))
    {
        const result_string = format_number_to_string(result.value, 2, NumberDisplayType.scaled)
        const result_units = prepare_result_units_for_display(result.units)

        output_element = <span>
            &nbsp;=&nbsp;{result_string}
            <span style={{ fontSize: "75%" }}>&nbsp;{result_units}</span>
        </span>
    }

    return <Box key={calc.name + " " + index} p={1} flexGrow={1} flexShrink={1} flexBasis="100%" maxWidth="100%" marginTop="5px" style={{ display: "flex" }}>
        <Box style={{ width: "100%", display: "flex" }}>
            {result && result.error && <WarningTriangleV2 warning={result.error} label="" />}
            {calc.name}&nbsp;=&nbsp;
            {(editing || (!editing && calc.value !== "")) &&<EditableTextSingleLine
                placeholder="Calculation"
                hide_label={true}
                value={calc.value}
                on_blur={value => props.update_calculation({ ...calc, value })}
                on_blur_type={EditableTextOnBlurType.conditional}
            />}
            &nbsp;
            {(editing || (!editing && calc.units)) && <EditableTextSingleLine
                placeholder="Units"
                hide_label={true}
                value={calc.units || ""}
                on_blur={units => props.update_calculation({ ...calc, units: units ? units : undefined })}
                on_blur_type={EditableTextOnBlurType.conditional}
            />}
            {output_element}
        </Box>

        {props.editing && <IconButton onClick={() => props.update_calculation(null)} size="large">
            <DeleteIcon />
        </IconButton>}
    </Box>
}



export function values_different (value1: string, value2: number)
{
    return value1 !== value2.toString()
}
