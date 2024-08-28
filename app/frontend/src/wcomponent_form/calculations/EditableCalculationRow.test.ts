import { describe, test } from "../../shared/utils/test"
import { should_show_calc_value } from "./EditableCalculationRow"



export const run_EditableCalculationRow_tests = describe.delay("EditableCalculationRow support functions", () =>
{
    describe("should_show_calc_value", () =>
    {
        let calculation_value: string
        let result: boolean


        // calculation_value = "A * B"
        // result = should_show_calc_value(calculation_value)
        // test(result, true, "Should return true for A * B")


        // calculation_value = "A * B"
        // result = should_show_calc_value(calculation_value)
        // test(result, true, "Should return true for A * B when called a second time")


        calculation_value = "(@@02d4a5f4-4abd-41a2-bb50-e68e358a3169/@@e34796cf-ab9e-47b8-9ea5-20cb00fb611d)*@@86635a8b-f4f8-4489-8a02-b4f09c0a22ec"
        result = should_show_calc_value(calculation_value)
        test(result, true, "Should return true for calculation with wcomponent ids")
    })

})
