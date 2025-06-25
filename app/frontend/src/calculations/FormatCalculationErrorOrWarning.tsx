
import { ErrorOrWarningTriangleV2 } from "../sharedf/WarningTriangleV2"
import { CalculationResult } from "./interfaces"



interface CalculationErrorOrWarningMessage
{
    result: CalculationResult | undefined
}


export function CalculationResultErrorOrWarning (props: CalculationErrorOrWarningMessage)
{
    const { message, is_error } = get_error_or_warning_message(props.result)

    return <ErrorOrWarningTriangleV2
        message={message}
        is_error={is_error}
    />
}


function get_error_or_warning_message(result: CalculationResult | undefined)
{
    let message = ""
    let is_error = false

    if (result?.error) {
        message = `Error: ${result.error}`
        is_error = true
    }

    if (result?.warning) {

        if (result.error) message += "\n----\n"
        message += `Warning: ${result.warning}`
    }

    return { message, is_error }
}
