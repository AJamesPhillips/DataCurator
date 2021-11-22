import type { ViewType } from "../state/routing/interfaces"



const view_types_to_maintain = new Set<ViewType>(["knowledge", "priorities"])

export function optional_view_type (current_view: ViewType)
{
    const view = view_types_to_maintain.has(current_view) ? current_view : "knowledge"

    return view
}
