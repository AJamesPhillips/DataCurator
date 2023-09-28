import { unhide_currency_symbols } from "./hide_currency_symbols"



export function prepare_result_units_for_display (result_units: string)
{
    return unhide_currency_symbols(result_units)
}
