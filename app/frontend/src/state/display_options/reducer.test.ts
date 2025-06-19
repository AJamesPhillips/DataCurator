import { describe, test } from "../../../lib/datacurator-core/src/utils/test"
import { factory_root_reducer } from "../reducer"
import { get_starting_state } from "../starting_state"
import { fixture_get_starting_state_deps } from "../starting_state.test"
import { RootState } from "../State"
import { selector_can_not_edit } from "../user_info/selector"


function state_with_bases_by_id (state: RootState): RootState
{
    return {
        ...state,
        user_info: {
            ...state.user_info,
            bases_by_id: {
                [32]: {
                    id: 32,
                    title: "Test Base",
                    inserted_at: new Date("2024-01-01T00:00:00Z"),
                    updated_at: new Date("2024-01-01T00:00:00Z"),
                    owner_user_id: "user123",
                    public_read: true,
                    access_level: "editor",
                    can_edit: true,
                }
            }
        }
    }
}


export const test_display_reducer = describe.delay("display_reducer", () =>
{
    let state = get_starting_state(fixture_get_starting_state_deps)

    describe("default initial state", () =>
    {
        test(state.display_options.consumption_formatting, true, "default consumption formatting to true")
        test(state.display_options.circular_links, true, "default circular links to true")
        test(state.display_options.show_large_grid, false, "default show large grid to false")
        test(state.display_options.focused_mode, false, "default focused mode to false")
        test(state.display_options.display_time_marks, false, "default display time marks to false")
        test(state.display_options.animate_connections, false, "default animate connections to false")
        test(state.display_options.show_help_menu, false, "default show help menu to false")

        test(state.toast_message.warn_can_not_edit_ms, undefined, "warn_can_not_edit_ms should be undefined")
    })


    describe("toggle consumption formatting", () =>
    {
        state = get_starting_state(fixture_get_starting_state_deps)
        state = state_with_bases_by_id(state)

        const reducer = factory_root_reducer(state)
        state = reducer(state, { type: "toggle_consumption_formatting" })
        test(state.display_options.consumption_formatting, false, "should toggle consumption formatting to false")
        test(state.toast_message.warn_can_not_edit_ms, undefined, "warn_can_not_edit_ms should remain undefined")

        state = reducer(state, { type: "toggle_consumption_formatting" })
        test(state.display_options.consumption_formatting, true, "should toggle consumption formatting to true")
        test(state.toast_message.warn_can_not_edit_ms, undefined, "warn_can_not_edit_ms should remain undefined")
    })


    describe("consumption formatting toggle is ignored when can not edit", () =>
    {
        state = get_starting_state(fixture_get_starting_state_deps)
        const reducer = factory_root_reducer(state)

        const now = new Date().getTime()
        state.display_options.consumption_formatting = true // assert consumption formatting is true
        test(selector_can_not_edit(state), true, "assert can not edit is true")
        state = reducer(state, { type: "toggle_consumption_formatting" })
        test(state.display_options.consumption_formatting, true, "toggle consumption formatting should be ignored when can not edit")
        test((state.toast_message.warn_can_not_edit_ms || 0) >= now, true, "warn_can_not_edit_ms should be defined and greater than or equal to now")
    })


    describe("consumption formatting toggle is forced to true when can not edit", () =>
    {
        state = get_starting_state(fixture_get_starting_state_deps)
        const reducer = factory_root_reducer(state)

        state.display_options.consumption_formatting = false // assert consumption formatting is false
        test(selector_can_not_edit(state), true, "assert can not edit is true")
        state = reducer(state, { type: "toggle_consumption_formatting" })
        test(state.display_options.consumption_formatting, true, "toggle consumption formatting should be ignored when can not edit")
        test(state.toast_message.warn_can_not_edit_ms, undefined, "warn_can_not_edit_ms should remain undefined")
    })


    describe.skip("when consumption formatting is true and the base (project) loads and user can not edit then force consumption formatting to false", () =>
    {
        // 2025-06-19 Skipping writing this test because it is hard to write
        // well as we don't have a state machine for the application state in
        // terms of different loading of different data, etc.  And as
        // `consumption_formatting` defaults to true for new users then they
        // should not have an opportunity to set it to false before a base loads
        // that they can not edit.

        // Once a user has created an account and has started editing then yes
        // it would be preferable to have this test and functionality in place.
    })
})
