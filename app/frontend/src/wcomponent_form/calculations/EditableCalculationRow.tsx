import { Box, IconButton } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"

import { CalculationResult, PlainCalculationObject } from "../../calculations/interfaces"
import { WarningTriangle } from "../../sharedf/WarningTriangle"
import { WarningTriangleV2 } from "../../sharedf/WarningTriangleV2"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"
import { useState } from "preact/hooks"
import { EditableTextOnBlurType } from "../../form/editable_text/editable_text_common"



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
    const { calculation: calc, index, calculation_results: results } = props

    const result = results[index]

    let result_string = ""
    if (result?.value && values_different(calc.value, result.value))
    {
        result_string = `= ${result?.value}`
    }

    return <div key={calc.name + " " + index}>
        <Box style={{ width: "100%" }}>
            {result && result.error && <WarningTriangleV2 warning={result.error} label="" />}
            {calc.name} =
            <EditableTextSingleLine
                placeholder="Calculation"
                hide_label={true}
                value={calc.value}
                on_blur={value => props.update_calculation({ ...calc, value })}
                on_blur_type={EditableTextOnBlurType.conditional}
            />
            {result_string}
        </Box>

        {props.editing && <IconButton onClick={() => props.update_calculation(null)} size="large">
            <DeleteIcon />
        </IconButton>}
    </div>
}



export function values_different (value1: string, value2: number)
{
    return value1 !== value2.toString()
}
