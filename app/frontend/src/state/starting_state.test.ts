import { describe, test } from "../../lib/datacurator-core/src/utils/test"
import { DependenciesForGettingStartingState } from "./interfaces"
import { get_starting_state } from "./starting_state"


const demo_url_hash = "#views/&storage_location=32&subview_id=e9b59c81-002f-4262-b6b1-995399a7606f&view=knowledge&x=110&y=32&zoom=90&sdate=2025-06-12&stime=16:19:59&cdate=2025-06-19&ctime=01:14:15"
export const fixture_get_starting_state_deps: DependenciesForGettingStartingState =
{
    get_date: () => new Date("2025-06-19T00:00:00Z"),
    get_url: () => `http://localhost:5173/app/${demo_url_hash}`,
    get_url_hash: () => demo_url_hash,
    get_persisted_state_object: key => ({})
}


export const test_getting_starting_state = describe.delay("get_starting_state", () =>
{
    let state = get_starting_state()
    test(!!state, true)

    state = get_starting_state(fixture_get_starting_state_deps)
    test(state.routing.route, "views", "should use the fixture route")
    test(state.routing.args.storage_location, 32, "should use the fixture storage location")
})
