import { Box, IconButton } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"

import { CalculationResult, PlainCalculationObject } from "../../calculations/interfaces"
import { WarningTriangleV2 } from "../../sharedf/WarningTriangleV2"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"
import { EditableTextOnBlurType } from "../../form/editable_text/editable_text_common"
import { NumberDisplayType, format_number_to_string } from "../../shared/format_number_to_string"
import { get_valid_calculation_name_id } from "./get_valid_calculation_name_id"
import { make_calculation_safe_for_rich_text } from "./make_calculation_safe_for_rich_text"
import { double_at_mentioned_uuids_regex } from "../../sharedf/rich_text/id_regexs"



export interface CalculationRowProps
{
    editing: boolean
    calculation: PlainCalculationObject
    calculation_result: CalculationResult | undefined
    existing_calculation_name_ids: string[]
    update_calculation: (calculation: PlainCalculationObject | null) => void
}

export function EditableCalculationRow (props: CalculationRowProps)
{
    const {
        calculation: calc,
        calculation_result: result,
        editing,
        existing_calculation_name_ids,
    } = props


    if (!editing && !calc.value && !calc.units) return null

    let output_element = <span />
    if (result !== undefined && result.value !== undefined) // && values_different(calc.value, result.value))
    {
        const result_string = format_number_to_string(result.value, 2, NumberDisplayType.simple)

        output_element = <span>
            &nbsp;=&nbsp;{result_string}
            <span style={{ fontSize: "75%" }}>&nbsp;{result.units}</span>
        </span>
    }


    const show_calc_value = editing || should_show_calc_value(calc.value)


    return <Box
        p={1}
        flexGrow={1}
        flexShrink={1}
        flexBasis="100%"
        maxWidth="100%"
        marginTop="5px"
        flexDirection={editing ? "column" : "row"}
        style={{ display: "flex" }}
    >
        <Box style={{ width: "100%", display: "flex" }}>
            {result && result.error && <WarningTriangleV2 warning={result.error} label="" />}

            <EditableTextSingleLine
                size="small"
                // style={{ width: "120px" }}
                placeholder=""
                hide_label={true}
                value={calc.name}
                on_blur={potential_name =>
                {
                    const other_existing_calculation_name_ids = existing_calculation_name_ids.filter(id => id !== calc.name)
                    const valid_name = get_valid_calculation_name_id(other_existing_calculation_name_ids, potential_name)
                    props.update_calculation({
                        ...calc,
                        name: valid_name,
                    })
                }}
                on_blur_type={EditableTextOnBlurType.conditional}
            />

            {show_calc_value && <>
                &nbsp;=&nbsp;
                <EditableTextSingleLine
                    placeholder="Calculation"
                    hide_label={true}
                    value={editing ? calc.value : make_calculation_safe_for_rich_text(calc.value)}
                    on_blur={value => props.update_calculation({ ...calc, value })}
                    on_blur_type={EditableTextOnBlurType.conditional}
                />
                &nbsp;
            </>}
            {editing && <EditableTextSingleLine
                placeholder="Units"
                hide_label={true}
                value={calc.units || ""}
                on_blur={units => props.update_calculation({ ...calc, units: units ? units : undefined })}
                on_blur_type={EditableTextOnBlurType.conditional}
            />}

            {!editing && output_element}
        </Box>

        {/* If we're editing then place the result on a new line */}
        {editing && <Box style={{ width: "100%", display: "flex" }}>
            {output_element}
        </Box>}

        {props.editing && <Box style={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => props.update_calculation(null)} size="large">
                <DeleteIcon />
            </IconButton>
        </Box>}
    </Box>
}



export function values_different (value1: string, value2: number)
{
    return value1 !== value2.toString()
}



const CALULATION_SIGNS = /.*[\^*\/+\-()].*/g
export function should_show_calc_value (value: string): boolean
{
    value = value.replaceAll(double_at_mentioned_uuids_regex, "")
    return !!value.match(CALULATION_SIGNS)
}
