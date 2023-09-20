import { FullCalculationObject, ParsedCalculationObject } from "../interfaces"



export function parse_calculation_equations (calculation_objects: FullCalculationObject[]): ParsedCalculationObject[]
{
    return calculation_objects.map(parse_calculation_equation)
}


function parse_calculation_equation (calculation: FullCalculationObject)
{
    if (!calculation.valid) return calculation

    // Ok so we could use the same syntax as Insight maker, then we pass the
    // value to Simulation ... and we want to know if it's parsed anything out.



    // So if calculation.value_str was the same format as InsightMaker, then we
    // could just pass this to the "simulation" package?
    // That would be good but then we'd be locking and limiting ourselves to that
    //   * The syntax
    //   * The function they provide
    //   * The implementation of the functions they provide
    //   * ?
    //
    // But it would be very fast to get going with something and I think it's
    // better we try it out and have an implementation we can play with and then
    // accept or reject and document the pros and cons, than we just try
    // straight away to implement our own implementation.
    // I don't know if we will be able to use the current idea of "needs_computing"
    // because I don't know what I'm doing.... we want to render:
    // A * B =
    //       ^
    // And then render
    // A * B = A * 123
    // So we still need to know it's a calculation
    // We still need to know we have different values and an operation to apply
    // to them "*".
    // We still need to know that we don't have all the values (e.g. "A") so we
    // have to stop at "A * B = A * 123" and not try to compute A * 123

    return { ...calculation, needs_computing: false }
}
