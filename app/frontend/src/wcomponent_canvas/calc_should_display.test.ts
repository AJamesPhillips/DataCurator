import { describe, test } from "../shared/utils/test"
import { prepare_new_contextless_wcomponent_object } from "../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import { wcomponent_is_causal_link } from "../wcomponent/interfaces/SpecialisedObjects"
import { calc_connection_wcomponent_should_display, CalculateConnectionCertaintyArgs } from "./calc_should_display"


export const test_calc_connection_wcomponent_should_display = describe.delay("calc_connection_wcomponent_should_display", () =>
{
    const created_at = new Date("2024-08-29T11:00:00.000Z")
    const created_at_ms = created_at.getTime()
    const sim_ms = new Date("2024-08-29T11:00:00.000Z").getTime()

    const get_args = (): CalculateConnectionCertaintyArgs =>
    {
        let wcomponent = prepare_new_contextless_wcomponent_object({
            type: "causal_link",
            base_id: -1,
            created_at,
        })
        if (!wcomponent_is_causal_link(wcomponent))
        {
            throw new Error(`Need a causal_link component for tests but got "${wcomponent.type}"`)
        }


        const from_wc = prepare_new_contextless_wcomponent_object({
            type: "causal_link",
            base_id: -1,
            created_at,
        })
        const to_wc = prepare_new_contextless_wcomponent_object({
            type: "statev2",
            base_id: -1,
            created_at,
        })


        return {
            wcomponent,
            kv_entry: { left: 0, top: 0 },
            validity_filter: {
                only_certain_valid: false,
                only_maybe_valid: false,
                maybe_invalid: false,
                show_invalid: true,
            },
            from_wc,
            to_wc,
            from_wc__kv_entry: { left: 0, top: 0 },
            to_wc__kv_entry: { left: 0, top: 0 },
            created_at_ms,
            sim_ms,
            selected_wcomponent_ids_set: new Set(),
            wc_ids_excluded_by_filters: new Set(),
        }
    }


    let args = get_args()
    let result = calc_connection_wcomponent_should_display(args)
    test(result, { display_certainty: 1 }, "should display")


    args = get_args()
    args.wcomponent.created_at = new Date(created_at_ms + 1)
    result = calc_connection_wcomponent_should_display(args)
    test(result, false, "should not display if created in future")


    args = get_args()
    args.wc_ids_excluded_by_filters.add(args.wcomponent.id)
    result = calc_connection_wcomponent_should_display(args)
    test(result, false, "should not display if it list of ids excluded by filters")


    args = get_args()
    args.from_wc = undefined
    args.from_wc__kv_entry = undefined
    result = calc_connection_wcomponent_should_display(args)
    test(result, { display_certainty: 1 }, "should display if from_wc not present")


    args = get_args()
    args.to_wc = undefined
    args.to_wc__kv_entry = undefined
    result = calc_connection_wcomponent_should_display(args)
    test(result, { display_certainty: 1 }, "should display if to_wc not present")


    args = get_args()
    args.from_wc = undefined
    args.from_wc__kv_entry = undefined
    args.wc_ids_excluded_by_filters.add(args.wcomponent.id)
    result = calc_connection_wcomponent_should_display(args)
    test(result, false, "should not display if from_wc not present and id is in list of ids excluded by filters")

})
