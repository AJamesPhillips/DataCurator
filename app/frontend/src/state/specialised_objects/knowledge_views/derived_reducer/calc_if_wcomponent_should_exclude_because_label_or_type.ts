import { test } from "../../../../shared/utils/test"
import {
    prepare_new_contextless_wcomponent_object,
} from "../../../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import type { WComponent } from "../../../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentType } from "../../../../wcomponent/interfaces/wcomponent_base"



interface LabelFilterArgs
{
    exclude_by_label_ids: Set<string>
    include_by_label_ids: Set<string>
    // include_by_label_ids_list: string[]
    exclude_by_component_types: Set<WComponentType>
    include_by_component_types: Set<WComponentType>
}
export function calc_if_wcomponent_should_exclude_because_label_or_type (wcomponent: WComponent, label_filter_args: LabelFilterArgs)
{
    const { id, label_ids = [], type } = wcomponent
    // const applied_ids = new Set(label_ids)

    const {
        exclude_by_label_ids,
        include_by_label_ids,
        // include_by_label_ids_list,
        exclude_by_component_types,
        include_by_component_types,
    } = label_filter_args

    const labels__should_exclude = (
        exclude_by_label_ids.has(id)
        ||
        !!(label_ids.find(label_id => exclude_by_label_ids.has(label_id)))
    )
    // OR inclusion:
    // The check of size > 0 is not an optimisation it ensures that lacks_include is false when no labels for inclusion by
    const labels__lacks_include = include_by_label_ids.size > 0 && (
        !include_by_label_ids.has(id)
        &&
        !(label_ids.find(label_id => include_by_label_ids.has(label_id)))
    )
    // AND inclusion:
    // const labels__lacks_include = !!(include_by_label_ids_list.find(label_id => !applied_ids.has(label_id)))

    const types__should_exclude = exclude_by_component_types.has(type)
    const types__lacks_include = include_by_component_types.size > 0 && !include_by_component_types.has(type)

    const should_exclude = labels__should_exclude || types__should_exclude
    const lacks_include = labels__lacks_include || types__lacks_include

    return { should_exclude, lacks_include }
}



function run_tests ()
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
}

run_tests()
