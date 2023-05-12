import { WComponent } from "../../wcomponent/interfaces/SpecialisedObjects"
import { WComponentType } from "../../wcomponent/interfaces/wcomponent_base"



export interface DerivedAvailableFilterOptions
{
    wc_label_ids: Set<string>
    wc_types: WComponentType[]
}



export function get_available_filter_options (wcomponents: WComponent[]): DerivedAvailableFilterOptions
{
    const wc_label_ids = new Set<string>()
    const wc_types_set = new Set<WComponentType>()

    wcomponents.forEach(wc =>
    {
        if (wc.label_ids) wc.label_ids.forEach(id => wc_label_ids.add(id))
        wc_types_set.add(wc.type)
    })

    const wc_types: WComponentType[] = Array.from(wc_types_set).sort()

    return { wc_label_ids, wc_types }
}
