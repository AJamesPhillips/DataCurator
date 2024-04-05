import { describe, test } from "../../shared/utils/test"
import { should_show_calc_value } from "./EditableCalculationRow"



export const run_EditableCalculationRow_tests = describe.delay("EditableCalculationRow support functions", () =>
{
    describe("should_show_calc_value", () =>
    {
        let calculation_value: string
        let result: boolean


        calculation_value = "A * B"
        result = should_show_calc_value(calculation_value)
        test(result, true, "Should return true for A * B")


        calculation_value = "A * B"
        result = should_show_calc_value(calculation_value)
        test(result, true, "Should return true for A * B when called a second time")
    })

})
