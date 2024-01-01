import { useState } from "preact/hooks"
import { Box, IconButton } from "@mui/material"
import { Settings as SettingsIcon } from "@mui/icons-material"

import { CalculationResult, PlainCalculationObject } from "../../calculations/interfaces"
import { WarningTriangleV2 } from "../../sharedf/WarningTriangleV2"
import { EditableTextSingleLine } from "../../form/editable_text/EditableTextSingleLine"
import { EditableTextOnBlurType } from "../../form/editable_text/editable_text_common"
import { format_number_to_string } from "../../shared/format_number_to_string"
import { get_valid_calculation_name_id } from "./get_valid_calculation_name_id"
import { make_calculation_safe_for_rich_text } from "./make_calculation_safe_for_rich_text"
import { double_at_mentioned_uuids_regex } from "../../sharedf/rich_text/id_regexs"
import { EditableCalculationRowCommands, EditableCalculationRowOptions } from "./EditableCalculationRowOptions"
import { EditableCalculationRowResultsFormatting } from "./EditableCalculationRowResultsFormatting"
import { get_default_result_display_type, get_default_significant_figures } from "./get_default_formatting"
import { RichMarkDown } from "../../sharedf/rich_text/RichMarkDown"
import { CSSProperties } from "preact/compat"



export interface CalculationRowProps
{
    editing: boolean
    show_options: boolean
    set_show_options: (show_options: boolean) => void
    calculation: PlainCalculationObject
    calculation_result: CalculationResult | undefined
    existing_calculation_name_ids: string[]
    update_calculation: (calculation: PlainCalculationObject | null) => void
    disallowed_commands: Set<EditableCalculationRowCommands>
    update_calculations: (command: EditableCalculationRowCommands) => void
}

export function EditableCalculationRow (props: CalculationRowProps)
{
    const {
        calculation: calc,
        calculation_result: result,
        editing,
        existing_calculation_name_ids,
        show_options,
        set_show_options,
    } = props

    // result significant figures
    const default_significant_figures = get_default_significant_figures(calc.value)
    const { result_sig_figs = default_significant_figures } = calc
    const [temp_result_sig_figs, set_temp_result_sig_figs] = useState<number | undefined>(result_sig_figs)
    // result display type
    const default_result_display_type = get_default_result_display_type(calc.value)
    const { result_display_type = default_result_display_type } = calc


    if (!editing && !calc.value && !calc.units) return null

    let output_element = <div />
    if (result !== undefined && result.value !== undefined) // && values_different(calc.value, result.value))
    {
        const result_string = format_number_to_string(result.value, temp_result_sig_figs ?? default_significant_figures, result_display_type)

        output_element = <div>
            &nbsp;=&nbsp;{result_string}
            {result.units && <span
                style={{ fontSize: "14px" }}
            >
                &nbsp;{result.units}
            </span>}
            {calc.result_description && <span
                style={{ fontSize: "14px" }}
            >
                &nbsp;<RichMarkDown text={calc.result_description} />
            </span>}
            {/* {editing && <IconButton
                onClick={() => set_show_options(!show_options)}
                size="small"
                style={{ marginLeft: "5px" }}
                // title="Format results"
            >
                <SettingsIcon />
            </IconButton>} */}
        </div>
    }


    const show_calc_value = editing || should_show_calc_value(calc.value)


    const common_css: CSSProperties = { width: "100%", display: "flex" }


    return <Box
        p={1}
        flexGrow={1}
        flexShrink={1}
        flexBasis="100%"
        maxWidth="100%"
        marginTop="5px"
        marginBottom={editing ? "18px" : undefined }
        flexDirection={editing ? "column" : "row"}
        style={{ display: "flex" }}
        className={"form_section " + (show_options ? "" : "hidden_border")}
    >
        {result && <div style={{
            ...common_css,
            maxHeight: result.error ? 100 : 0,
            transition: "max-height 1s ease 0s"
        }}>
            <WarningTriangleV2 warning={result.error || ""} label="" />
        </div>}

        <div style={{ width: "100%", display: "flex" }}>
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
        </div>

        {/* If we're editing then place the result on a new line */}
        {editing && <div style={{ ...common_css, marginTop: undefined }}>
            {output_element}

            {/* Whilst editing then display an icon "button" to show/hide options */}
            <IconButton
                onClick={() => set_show_options(!show_options)}
                size="small"
                style={{ marginLeft: "auto" }}
            >
                <SettingsIcon />
            </IconButton>
        </div>}

        {props.editing && show_options && <EditableCalculationRowResultsFormatting
            result={result?.value}
            default_significant_figures={default_significant_figures}
            temp_result_sig_figs={temp_result_sig_figs}
            set_temp_result_sig_figs={set_temp_result_sig_figs}
            result_display_type={result_display_type}
            update_calculation={partial =>
            {
                props.update_calculation({
                    ...calc,
                    ...partial,
                })
            }}
        />}

        {props.editing && show_options && <div style={{ ...common_css, marginLeft: 10, marginTop: 20 }}>
            <div style={{ display: "flex" }}>
                <EditableTextSingleLine
                    size="small"
                    // style={{ marginLeft: 5, marginTop: 5, width: "80px" }}
                    placeholder="Description"
                    value={calc.result_description || ""}
                    on_blur_type={EditableTextOnBlurType.conditional}
                    on_blur={value =>
                    {
                        const result_description = value ? value : undefined
                        props.update_calculation({ ...calc, result_description })
                    }}
                />
            </div>
        </div>}

        {props.editing && show_options && <div style={{ ...common_css, justifyContent: "flex-end" }}>
            <EditableCalculationRowOptions
                delete_calculation={() => props.update_calculation(null)}
                disallowed_commands={props.disallowed_commands}
                update_calculations={props.update_calculations}
            />
        </div>}
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
