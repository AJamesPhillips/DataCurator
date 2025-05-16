import { describe, test } from "datacurator-core/utils/test"
import {
    prepare_new_contextless_wcomponent_object,
} from "../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import {
    calc_if_wcomponent_should_exclude_because_label_or_type,
    LabelFilterArgs,
} from "./calc_if_wcomponent_should_exclude_because_label_or_type"



export const test_calc_if_wcomponent_should_exclude_because_label_or_type = describe.delay("calc_if_wcomponent_should_exclude_because_label_or_type", () =>
{
    const wcomponent1 = prepare_new_contextless_wcomponent_object({
        id: "1", base_id: 1,
    })
    const wcomponent2 = prepare_new_contextless_wcomponent_object({
        id: "2", base_id: 1, label_ids: [wcomponent1.id],
    })
    const wcomponent3 = prepare_new_contextless_wcomponent_object({
        id: "3", base_id: 1, label_ids: [],
    })


    const label_filter_args__empty: LabelFilterArgs = {
        exclude_by_label_ids: new Set(),
        include_by_label_ids: new Set(),
        exclude_by_component_types: new Set(),
        include_by_component_types: new Set(),
    }
    const label_filter_args__exclude_1: LabelFilterArgs = {
        exclude_by_label_ids: new Set([wcomponent1.id]),
        include_by_label_ids: new Set(),
        exclude_by_component_types: new Set(),
        include_by_component_types: new Set(),
    }
    const label_filter_args__include_1: LabelFilterArgs = {
        exclude_by_label_ids: new Set(),
        include_by_label_ids: new Set([wcomponent1.id]),
        exclude_by_component_types: new Set(),
        include_by_component_types: new Set(),
    }
    const label_filter_args__ex_and_include_1: LabelFilterArgs = {
        exclude_by_label_ids: new Set([wcomponent1.id]),
        include_by_label_ids: new Set([wcomponent1.id]),
        exclude_by_component_types: new Set(),
        include_by_component_types: new Set(),
    }

    let { should_exclude, lacks_include } = calc_if_wcomponent_should_exclude_because_label_or_type(wcomponent2, label_filter_args__empty)
    test(should_exclude, false)
    test(lacks_include, false)

    ;({ should_exclude, lacks_include } = calc_if_wcomponent_should_exclude_because_label_or_type(wcomponent2, label_filter_args__exclude_1))
    test(should_exclude, true)
    test(lacks_include, false)

    ;({ should_exclude, lacks_include } = calc_if_wcomponent_should_exclude_because_label_or_type(wcomponent2, label_filter_args__include_1))
    test(should_exclude, false)
    test(lacks_include, false)

    // Should lack include when not labelled
    ;({ should_exclude, lacks_include } = calc_if_wcomponent_should_exclude_because_label_or_type(wcomponent3, label_filter_args__include_1))
    test(should_exclude, false)
    test(lacks_include, true)

    ;({ should_exclude, lacks_include } = calc_if_wcomponent_should_exclude_because_label_or_type(wcomponent2, label_filter_args__ex_and_include_1))
    test(should_exclude, true)
    test(lacks_include, false)

    // Should exclude self
    ;({ should_exclude, lacks_include } = calc_if_wcomponent_should_exclude_because_label_or_type(wcomponent1, label_filter_args__exclude_1))
    test(should_exclude, true)
    test(lacks_include, false)

    // Should include self
    ;({ should_exclude, lacks_include } = calc_if_wcomponent_should_exclude_because_label_or_type(wcomponent1, label_filter_args__include_1))
    test(should_exclude, false)
    test(lacks_include, false)

})
