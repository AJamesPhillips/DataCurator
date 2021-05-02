import { h, FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { EditableTextSingleLine } from "../form/EditableTextSingleLine"
import { ExpandableListWithAddButton } from "../form/editable_list/ExpandableListWithAddButton"
import { factory_render_list_content } from "../form/editable_list/render_list_content"
import type { CounterfactualLayer } from "../shared/models/interfaces/counterfactual"
import { date2str } from "../shared/utils/date_helpers"
import { ACTIONS } from "../state/actions"
import type { ActionChangeRouteArgs } from "../state/routing/actions"
import { create_new_counterfactual_layer } from "./create_new_counterfactual_layer"



interface OwnProps
{
    counterfactual_layers: CounterfactualLayer[]
    on_change: (new_counterfactual_layers: CounterfactualLayer[]) => void
    // color?: "one" | "two"
}



const map_dispatch = {
    change_route: ACTIONS.routing.change_route
}

const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _CounterfactualsList (props: Props)
{
    const { counterfactual_layers, on_change } = props

    return <ExpandableListWithAddButton
        items_count={counterfactual_layers.length}
        on_click_new_item={() =>
        {
            const new_cfl = create_new_counterfactual_layer({ title: make_default_title() })
            on_change([ ...counterfactual_layers, new_cfl ])
        }}
        content={factory_render_list_content({
            items: counterfactual_layers,
            get_id: kv => kv.id,
            update_items: new_cfls =>
            {
                on_change(new_cfls)
            },

            item_top_props: {
                get_summary: get_summary(props.change_route),
                get_details,
            },

            item_descriptor: "Counterfactual layer",
        })}
        item_descriptor="Counterfactual layer"
        disable_collapsed={true}
    />
}

export const CounterfactualsList = connector(_CounterfactualsList) as FunctionalComponent<OwnProps>



const make_default_title = () => date2str(new Date(), "yyyy-MM-dd")



const get_summary = (change_route: (routing_state: ActionChangeRouteArgs) => void) =>
(counterfactual_layer: CounterfactualLayer, on_change: (new_cfl: CounterfactualLayer) => void) =>
{
    return <div style={{ display: "inline-flex"}}>
        <input
            type="checkbox"
            checked={false}
            onClick={() => change_route({ args: { subview_id: counterfactual_layer.id } })}
        />
        <EditableTextSingleLine
            placeholder="Title..."
            value={counterfactual_layer.title}
            on_change={new_title => {
                const title = new_title || make_default_title()
                on_change({ ...counterfactual_layer, title })
            }}
        />
    </div>
}



function get_details (counterfactual_layer: CounterfactualLayer, on_change: (new_cfl: CounterfactualLayer) => void)
{
    return <div></div>
}
