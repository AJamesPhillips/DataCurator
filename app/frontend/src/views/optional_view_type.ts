import type { ViewType } from "../state/routing/interfaces"



export function optional_view_type (current_view: ViewType)
{
    const view_types_to_maintain: Set<ViewType> = new Set(["knowledge", "priorities"])
    const view = view_types_to_maintain.has(current_view) ? current_view : "knowledge"

    return view
}
