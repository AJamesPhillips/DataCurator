import { h } from "preact"

import { EditableTextSingleLine } from "../form/EditableTextSingleLine"
import { ExpandableListWithAddButton } from "../form/editable_list/ExpandableListWithAddButton"
import { factory_render_list_content } from "../form/editable_list/render_list_content"
import type { CounterfactualLayer } from "../shared/models/interfaces/counterfactual"
import { date2str } from "../shared/utils/date_helpers"
import { sort_list } from "../shared/utils/sort"
import { Link } from "../utils/Link"
import { create_new_counterfactual_layer } from "./create_new_counterfactual_layer"



interface OwnProps
{
    counterfactual_layers: CounterfactualLayer[]
}

export function CounterfactualsList (props: OwnProps)
{
    const { counterfactual_layers } = props

    return <ExpandableListWithAddButton
        items_count={counterfactual_layers.length}
        on_click_new_item={() =>
        {
            const knowledge_view = create_new_counterfactual_layer({ title: make_default_title() })
            // props.upsert_knowledge_view({ knowledge_view })
        }}
        content={factory_render_list_content({
            items: counterfactual_layers,
            get_id: kv => kv.id,
            update_items: new_cfls =>
            {
                const changed_kv = new_cfls.find((new_cfl, index) => counterfactual_layers[index] !== new_cfl)
                if (!changed_kv) return
                // props.upsert_knowledge_view({ knowledge_view: changed_kv })
            },

            item_top_props: { get_summary, get_details },

            item_descriptor: "Counterfactual",
        })}
        item_descriptor="Counterfactual"
        disable_collapsed={true}
    />
}



const make_default_title = () => date2str(new Date(), "yyyy-MM-dd")



function get_summary (counterfactual_layer: CounterfactualLayer, on_change: (new_cfl: CounterfactualLayer) => void)
{
    return <Link
        route={undefined}
        sub_route={undefined}
        item_id={undefined}
        args={{ view: "knowledge", subview_id: counterfactual_layer.id }}
        selected_on={new Set(["route", "args.subview_id"])}
    >
        {counterfactual_layer.title}
    </Link>
}



function get_details (counterfactual_layer: CounterfactualLayer, on_change: (new_cfl: CounterfactualLayer) => void)
{
    const counterfactuals = sort_list(
        Object.values(counterfactual_layer.counterfactual_layer_id_map),
        counterfactual_layer => counterfactual_layer.created_at.getTime(),
        "descending"
    )

    return <div>
        <EditableTextSingleLine
            placeholder="Title..."
            value={counterfactual_layer.title}
            on_change={new_title => {
                const default_title = counterfactual_layer.is_base ? "Base" : make_default_title()
                on_change({ ...counterfactual_layer, title: new_title || default_title })
            }}
        />

        <br />

        <CounterfactualsList counterfactual_layers={counterfactuals} />
    </div>
}
