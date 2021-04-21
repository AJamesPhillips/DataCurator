import { AppState } from "../../../app/shared/state/shape"
import { all_reducers } from "../../../app/shared/state/reducers"

describe("top level app reducer", () => {
    it("should initialise all keys", () => {
        const result = all_reducers({} as AppState, {type: "something else"})
        expect(result).toHaveProperty("routing")
    })
})
