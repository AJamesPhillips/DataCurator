
// From https://www.xe.com/symbols/
export const currency_symbol_string_map =
{
    "£": "CURRENCY_POUND",
    "$": "CURRENCY_DOLLAR",
    "€": "CURRENCY_EURO",
    "¥": "CURRENCY_YUAN_TWO",
    "Ұ": "CURRENCY_YUAN_ONE",
    "₹": "CURRENCY_RUPEE_RX",
    "₨": "CURRENCY_RUPEE_RS",
    "¢": "CURRENCY_GHANA_CEDI",
    "؋": "CURRENCY_AFGHANISTAN_AFGHANI",
    "฿": "CURRENCY_THAILAND_BAHT",
    "៛": "CURRENCY_CAMBODIA_RIEL",
    "₡": "CURRENCY_COSTA_RICA_COLON",
    "₦": "CURRENCY_NIGERIA_NAIRA",
    "₩": "CURRENCY_KOREA_WON",
    "₪": "CURRENCY_ISRAEL_SHEKEL",
    "₫": "CURRENCY_VIET_NAM_DONG",
    "₭": "CURRENCY_LAOS_KIP",
    "₮": "CURRENCY_MONGOLIA_TUGHRIK",
    "₱": "CURRENCY_PESO",
    "₴": "CURRENCY_UKRAINE_HRYVNIA",
    "₼": "CURRENCY_AZERBAIJAN_MANAT",
    "₽": "CURRENCY_RUSSIA_RUBLE",
    "﷼": "CURRENCY_RIAL",
    "B/.": "CURRENCY_PANAMA_BALBOA",
    "ƒ": "CURRENCY_GUILDER",
    "Kč": "CURRENCY_CZECH_REPUBLIC_KORUNA",
    "S/.": "CURRENCY_PERU_SOL",
    "zł": "CURRENCY_POLAND_ZLOTY",
    "ден": "CURRENCY_MACEDONIA_DENAR",
    "Дин.": "CURRENCY_SERBIA_DINAR",
    "лв": "CURRENCY_LEV_TENGE_SOM",
    "₺": "CURRENCY_TURKEY_LIRA",
}


// This functionality definitely belongs inside the Simulation.js package
// https://github.com/AJamesPhillips/DataCurator/issues/239
export function hide_currency_symbols (equation: string): string
{
    let converted_equation = equation
    Object.entries(currency_symbol_string_map).forEach(([symbol, str]) =>
    {
        converted_equation = converted_equation.replaceAll(symbol, str)
    })

    return converted_equation
}


export function unhide_currency_symbols (equation: string): string
{
    let converted_equation = equation
    Object.entries(currency_symbol_string_map).forEach(([symbol, str]) =>
    {
        converted_equation = converted_equation.replaceAll(new RegExp(str, "ig"), symbol)
    })

    return converted_equation
}
