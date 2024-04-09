import type { WComponent } from "../../../wcomponent/interfaces/SpecialisedObjects"
import type { WComponentType } from "../../../wcomponent/interfaces/wcomponent_base"



export interface LabelFilterArgs
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
