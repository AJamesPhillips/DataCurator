import { CustomUnit } from "simulation"
import { hidden_currency_string_set } from "./hide_currency_symbols"
import { MissingUnitsStrings } from "./interface"


/**
 * Copied and adpated from https://github.com/scottfr/simulation/tree/main/src/formula/Units.js
 */
const DEFAULT_SIMULATIONJS_UNITS = [
    {
        source: /^Degree$/i,
        targetString: "Degrees",
    },
    {
        source: /^Radians?$/i,
        targetString: "Degrees",
    },
    {
        source: /^Ampere$/i,
        targetString: "Amperes",
    },
    {
        source: /^Gram$/i,
        targetString: "Grams",
    },
    {
        source: /^Second$/i,
        targetString: "Seconds",
    },
    {
        source: /^Meter$/i,
        targetString: "Meters",
    },
    {
        source: /^(Meters? ?Squared?|Squared? ?Meters?)$/i,
        targetString: "Meters^2",
    },
    {
        source: /^(Centimeters? ?Squared?|Squared? ?Centimeters?)$/i,
        targetString: "Centimeters^2",
    },
    {
        source: /^(Centimeters? ?Cubed?|Cubic ?Centimeters?)$/i,
        targetString: "Centimeters^3",
    },
    {
        source: /^(Meters? Cubed?|Cubic ?Meters?)$/i,
        targetString: "Meters^3",
    },
    {
        source: /^(Kilometers? ?Cubed?|Cubic ?Kilometers?)$/i,
        targetString: "Kilometers^3",
    },
    {
        source: /^(Inches? Squared?|Squared? ?Inches?)$/i,
        targetString: "Inches^2",
    },
    {
        source: /^(Miles? ?Squared?|Squared? ?Miles?)$/i,
        targetString: "Miles^2",
    },
    {
        source: /^(Kilometers? Squared?|Squared? ?Kilometers?)$/i,
        targetString: "Kilometers^2",
    },
    {
        source: /^Acre? ?(Feet|Foot)$/i,
        targetString: "Acres,Feet",
    },
    {
        source: /^Meters? ?per ?Seconds?$/i,
        targetString: "Meters,Seconds^-1",
    },
    {
        source: /^Meters? ?per ?Seconds? ?Squared?$/i,
        targetString: "Meters,Seconds^-2",
    },
    {
        source: /^(Foot|Feet) ?per ?Seconds?$/i,
        targetString: "Feet,Seconds^-1",
    },
    {
        source: /^(Foot|Feet) ?per ?Seconds? ?Squared?$/i,
        targetString: "Feet,Seconds^-2",
    },
    {
        source: /^Miles? ?per ?Hours?$/i,
        targetString: "Miles,Hours^-1",
    },
    {
        source: /^Miles? ?per ?Hours? ?Squared?$/i,
        targetString: "Miles,Hours^-2",
    },
    {
        source: /^Kilometers? ?per ?Hours?$/i,
        targetString: "Kilometers,Hours^-1",
    },
    {
        source: /^Kilometers? ?per ?Hours? ?Squared?$/i,
        targetString: "Kilometers,Hours^-2",
    },
    {
        source: /^Liters? ?per ?Seconds?$/i,
        targetString: "Liters,Seconds^-1",
    },
    {
        source: /^(Cubic ?Meters?|Meters? ?Cubed?) ?per ?Seconds?$/i,
        targetString: "Meters^3,Seconds^-1",
    },
    {
        source: /^(Squared? ?Yards?|Yards? ?Squared?)$/i,
        targetString: "Yards^2",
    },
    {
        source: /^(Squared? ?(Feet|Foot)|(Feet|Foot) ?Squared?)$/i,
        targetString: "Feet^2",
    },
    {
        source: /^(Squared? Millimeters?|Millimeters? ?Squared?)$/i,
        targetString: "Millimeters^2",
    },
    {
        source: /^(Millimeters? ?Cubed?|Cubic ?Millimeters?)$/i,
        targetString: "Millimeters^3",
    },
    {
        source: /^Gallons? ?per ?Seconds?$/i,
        targetString: "Gallons,Seconds^-1",
    },
    {
        source: /^Gallons? ?per ?Minutes?$/i,
        targetString: "Gallons,Minutes^-1",
    },
    {
        source: /^Pounds? ?per ?Seconds?$/i,
        targetString: "Pounds,Seconds^-1",
    },
    {
        source: /^Kilograms? ?per ?Seconds?$/i,
        targetString: "Kilograms,Seconds^-1",
    },
    {
        source: /^Dollars? ?per ?Seconds?$/i,
        targetString: "Dollars,Seconds^-1",
    },
    {
        source: /^Dollars? ?per ?Hours?$/i,
        targetString: "Dollars,Hours^-1",
    },
    {
        source: /^Dollars? ?per ?Days?$/i,
        targetString: "Dollars,Days^-1",
    },
    {
        source: /^Dollars? ?per ?Weeks?$/i,
        targetString: "Dollars,Weeks^-1",
    },
    {
        source: /^Dollars? ?per ?Months?$/i,
        targetString: "Dollars,Months^-1",
    },
    {
        source: /^Dollars? ?per ?Quarters?$/i,
        targetString: "Dollars,Quarters^-1",
    },
    {
        source: /^Dollars? ?per ?Years?$/i,
        targetString: "Dollars,Years^-1",
    },
    {
        source: /^Euros? ?per ?Seconds?$/i,
        targetString: "Euros,Seconds^-1",
    },
    {
        source: /^Euros? ?per ?Hours?$/i,
        targetString: "Euros,Hours^-1",
    },
    {
        source: /^Euros? ?per ?Days?$/i,
        targetString: "Euros,Days^-1",
    },
    {
        source: /^Euros? ?per ?Weeks?$/i,
        targetString: "Euros,Weeks^-1",
    },
    {
        source: /^Euros? ?per ?Months?$/i,
        targetString: "Euros,Months^-1",
    },
    {
        source: /^Euros? ?per ?Quarters?$/i,
        targetString: "Euros,Quarters^-1",
    },
    {
        source: /^Euros? ?per ?Years?$/i,
        targetString: "Euros,Years^-1",
    },
    {
        source: /^Centimeters?$/i,
        targetString: "Meters",
    },
    {
        source: /^Millimeters?$/i,
        targetString: "Meters",
    },
    {
        source: /^Kilometers?$/i,
        targetString: "Meters",
    },
    {
        source: /^Inch(es)?$/i,
        targetString: "Meters",
    },
    {
        source: /^(Foot|Feet)$/i,
        targetString: "Meters",
    },
    {
        source: /^Yards?$/i,
        targetString: "Meters",
    },
    {
        source: /^Miles?$/i,
        targetString: "Meters",
    },
    {
        source: /^Acres?$/i,
        targetString: "Meters^2",
    },
    {
        source: /^Hectares?$/i,
        targetString: "Meters^2",
    },
    {
        source: /^Liters?$/i,
        targetString: "Meters^3",
    },
    {
        source: /^Gallons?$/i,
        targetString: "Meters^3",
    },
    {
        source: /^Quarts?$/i,
        targetString: "Meters^3",
    },
    {
        source: /^Fluid ?Ounces?$/i,
        targetString: "Meters^3",
    },
    {
        source: /^Years?$/i,
        targetString: "Seconds",
    },
    {
        source: /^Quarters?$/i,
        targetString: "Seconds",
    },
    {
        source: /^Months?$/i,
        targetString: "Seconds",
    },
    {
        source: /^Weeks?$/i,
        targetString: "Seconds",
    },
    {
        source: /^Days?$/i,
        targetString: "Seconds",
    },
    {
        source: /^Hours?$/i,
        targetString: "Seconds",
    },
    {
        source: /^Minutes?$/i,
        targetString: "Seconds",
    },
    {
        source: /^Kilograms?$/i,
        targetString: "Grams",
    },
    {
        source: /^Milligrams?$/i,
        targetString: "Grams",
    },
    {
        source: /^Ounces?$/i,
        targetString: "Grams",
    },
    {
        source: /^Pounds?$/i,
        targetString: "Grams",
    },
    {
        source: /^Tonnes?$/i,
        targetString: "Grams",
    },
    {
        source: /^Tons?$/i,
        targetString: "Grams",
    },
    {
        source: /^Watts?$/i,
        targetString: "Joules,Seconds^-1",
    },
    {
        source: /^Kilowatts?$/i,
        targetString: "Watts",
    },
    {
        source: /^Megawatts?$/i,
        targetString: "Watts",
    },
    {
        source: /^Gigawatts?$/i,
        targetString: "Watts",
    },
    {
        source: /^Calories?$/i,
        targetString: "Joules",
    },
    {
        source: /^Kilocalories?$/i,
        targetString: "Joules",
    },
    {
        source: /^(BTUs?|British ?Thermal ?units?)$/i,
        targetString: "Joules",
    },
    {
        source: /^Kilojoules?$/i,
        targetString: "Joules",
    },
    {
        source: /^Joules?$/i,
        targetString: "Newtons,Meters",
    },
    {
        source: /^Coulombs?$/i,
        targetString: "Amperes,Seconds",
    },
    {
        source: /^Volts?$/i,
        targetString: "Watts,Amperes^-1",
    },
    {
        source: /^Millivolts?$/i,
        targetString: "Volts",
    },
    {
        source: /^Kilovolts?$/i,
        targetString: "Volts",
    },
    {
        source: /^Newtons?$/i,
        targetString: "Kilograms,Meters,Seconds^-2",
    },
    {
        source: /^Pounds? ?Force$/i,
        targetString: "Pounds,Feet per Second Squared",
    },
    {
        source: /^Atoms?$/i,
        targetString: "Moles",
    },
    {
        source: /^Molecules?$/i,
        targetString: "Moles",
    },
    {
        source: /^Farads?$/i,
        targetString: "Joules,Volts^-2",
    },
    {
        source: /^Pascals?$/i,
        targetString: "Newton,Meters^-2",
    },
    {
        source: /^Kilopascals?$/i,
        targetString: "Pascals",
    },
    {
        source: /^Bars?$/i,
        targetString: "Pascals",
    },
    {
        source: /^Atmospheres?$/i,
        targetString: "Pascals",
    },
    {
        source: /^Pounds? ?per ?Squared? ?Inch(es)?$/i,
        targetString: "Pascals",
    }
]
const DEFAULT_TARGET_UNITS = new Set(DEFAULT_SIMULATIONJS_UNITS.map(unit =>
{
    return unit.targetString.toLowerCase()
}))


interface SuggestMissingUnitsReturn
{
    suggested_custom_units: CustomUnit[]
    unhandled_units: Set<string>
}
export function suggest_missing_units (missing_units_strings: MissingUnitsStrings, custom_units: CustomUnit[]): SuggestMissingUnitsReturn
{
    const { expected_units, actual_units } = missing_units_strings
    const expected_units_parts = extract_units(expected_units, true, custom_units)
    const actual_units_parts = extract_units(actual_units, true, custom_units)

    const suggested_custom_units: CustomUnit[] = []
    const custom_units_set = new Set<string>()

    function process_unit (unit: string)
    {
        const unit_without_s = unit.replace(/s$/g, "")
        const unit_with_s = unit_without_s + "s"

        if (custom_units_set.has(unit_without_s) || custom_units_set.has(unit_with_s)) return false

        if (actual_units_parts.has(unit_without_s) || actual_units_parts.has(unit_with_s))
        {
            custom_units_set.add(unit_without_s)
            custom_units_set.add(unit_with_s)
            suggested_custom_units.push({
                name: unit_without_s,
                scale: 1,
                target: unit_with_s,
            })
            return false
        }

        return true
    }

    const unhandled_expected_units = Array.from(expected_units_parts)
        .filter(unit => process_unit(unit))

    const unhandled_actual_units = Array.from(actual_units_parts)
        .filter(unit => process_unit(unit))

    const unhandled_units = new Set<string>(unhandled_expected_units.concat(unhandled_actual_units))

    return {
        suggested_custom_units,
        unhandled_units,
    }
}


export function extract_units (units: string, remove_known: boolean, custom_units: CustomUnit[]): Set<string>
{
    const unit_parts = units
        .toLowerCase()
        .replace(/[()]/g, " ")
        .split(/[*/]/g)
        .map(part =>
        {
            part = part.trim()
            if (part === "" || part === "unitless") return undefined

            if (hidden_currency_string_set.has(part))
            {
                return remove_known ? undefined : part
            }

            if (DEFAULT_TARGET_UNITS.has(part))
            {
                return remove_known ? undefined : part
            }

            const default_unit = DEFAULT_SIMULATIONJS_UNITS.find(unit => unit.source.test(part))
            if (default_unit)
            {
                return remove_known ? undefined : default_unit.targetString.toLowerCase()
            }

            const custom_unit = custom_units.find(unit =>
            {
                return (
                    unit.name.toLowerCase() === part
                    || unit.target.toLowerCase() === part
                )
            })
            if (custom_unit)
            {
                return remove_known ? undefined : custom_unit.target.toLowerCase()
            }
            return part
        })
        .filter(part => part !== undefined)

    return new Set(unit_parts)
}
