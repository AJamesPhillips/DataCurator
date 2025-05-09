import type { h } from "preact"

import type { ActionChangeRouteArgs } from "../state/routing/actions"



interface FactoryOnPointerDownArgs
{
    wcomponent_id: string
    shift_or_control_keys_are_down: boolean
    change_route: (routing_params: ActionChangeRouteArgs) => void
    clicked_wcomponent: (args: { id: string }) => void
    is_current_item: boolean
    clear_selected_wcomponents: () => void
}
export function factory_on_click (args: FactoryOnPointerDownArgs)
{
    const {
        wcomponent_id: id,
        shift_or_control_keys_are_down,
        change_route,
        clicked_wcomponent,
        clear_selected_wcomponents,
        is_current_item,
    } = args


    return (e: h.JSX.TargetedEvent<HTMLDivElement | SVGElement, MouseEvent>) => {
        e.stopImmediatePropagation()
        e.preventDefault()


        clicked_wcomponent({ id })

        if (shift_or_control_keys_are_down)
        {
            change_route({ route: "wcomponents", sub_route: "wcomponents_edit_multiple", item_id: null })
        }
        else
        {
            if (is_current_item)
            {
                change_route({ route: "wcomponents", sub_route: null, item_id: null })
                clear_selected_wcomponents()
            }
            else
            {
                change_route({ route: "wcomponents", sub_route: null, item_id: id })
            }
        }
    }
}
