import { render_app } from "../app/shared/views/app"
import { clean_up } from "./helper/clean_up"


describe("rendering", () => {
    it("renders without crashing", () => {
        const div = document.createElement("div")

        render_app(div)
    })

    afterAll(clean_up)
})
