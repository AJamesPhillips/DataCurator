/* eslint-disable @typescript-eslint/await-thenable */
import { describe, test } from "datacurator-core/utils/test"

export const test_sync_test = describe.delay("test sync", () => {
    test(true, true, "should handle sync")
})

export const test_async_test = describe.delay("test async", async () => {
    await new Promise(resolve => setTimeout(resolve, 0))
    test(true, true, "should handle async")

    await describe("test nested async", async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
        test(true, true, "should handle nested async")
    })

    describe("test sync nested in async", () => {
        test(true, true, "should handle sync nested in async")
    })
})
