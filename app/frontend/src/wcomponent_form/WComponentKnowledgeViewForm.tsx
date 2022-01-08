import { Box, FormControl, FormLabel, Slider } from "@material-ui/core"
import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { MoveToWComponentButton } from "../canvas/MoveToWComponentButton"
import { ConfirmatoryDeleteButton } from "../form/ConfirmatoryDeleteButton"
import { SelectKnowledgeView } from "../knowledge_view/SelectKnowledgeView"
import type { KnowledgeViewWComponentEntry } from "../shared/interfaces/knowledge_view"
import { Button } from "../sharedf/Button"
import { Link } from "../sharedf/Link"
import { ACTIONS } from "../state/actions"
import { get_middle_of_screen, lefttop_to_xy } from "../state/display_options/display"
import {
    get_current_knowledge_view_from_state,
    get_current_composed_knowledge_view_from_state,
} from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import type { WComponent } from "../wcomponent/interfaces/SpecialisedObjects"
import { ExploreButtonHandle } from "../wcomponent_canvas/node/ExploreButtonHandle"
import { WComponentBackReferences } from "../wcomponent_ui/WComponentBackReferences"
import { AlignComponentForm } from "./AlignComponentForm"



interface OwnProps
{
    wcomponent: WComponent
}


const map_state = (state: RootState, own_props: OwnProps) =>
{
    const { wcomponent } = own_props

    const current_knowledge_view = get_current_knowledge_view_from_state(state)

    const knowledge_view_entry = current_knowledge_view && current_knowledge_view.wc_id_map[wcomponent.id]
    const current_composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
    const composed_knowledge_view_entry = current_composed_knowledge_view && current_composed_knowledge_view.composed_wc_id_map[wcomponent.id]
    const all_knowledge_views = state.derived.knowledge_views
    const middle_position = get_middle_of_screen(state)

    return {
        knowledge_view_id: current_knowledge_view && current_knowledge_view.id,
        knowledge_view_title: current_knowledge_view && current_knowledge_view.title,
        composed_knowledge_view_entry,
        knowledge_view_entry,
        all_knowledge_views,
        editing: !state.display_options.consumption_formatting,
        middle_position_left: middle_position.left,
        middle_position_top: middle_position.top,
    }
}


const map_dispatch = {
    upsert_knowledge_view_entry: ACTIONS.specialised_object.upsert_knowledge_view_entry,
    bulk_remove_from_knowledge_view: ACTIONS.specialised_object.bulk_remove_from_knowledge_view,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _WComponentKnowledgeViewForm (props: Props)
{
    const { wcomponent, knowledge_view_id, knowledge_view_title, composed_knowledge_view_entry,
        knowledge_view_entry, all_knowledge_views, editing } = props

    const wcomponent_id = wcomponent.id


    const other_knowledge_views = all_knowledge_views
        .filter(({ id }) => id !== knowledge_view_id)
        .filter(({ wc_id_map }) =>
        {
            const entry = wc_id_map[wcomponent_id]
            return entry && !entry.blocked && !entry.passthrough
        })


    function upsert_entry (knowledge_view_id: string, new_entry_partial: Partial<KnowledgeViewWComponentEntry> = {})
    {
        const new_entry: KnowledgeViewWComponentEntry = {
            ...(composed_knowledge_view_entry || { left: props.middle_position_left, top: props.middle_position_top }),
            ...new_entry_partial,
        }

        props.upsert_knowledge_view_entry({
            wcomponent_id,
            knowledge_view_id,
            entry: new_entry,
        })
    }


    const not_present = !knowledge_view_entry || knowledge_view_entry.blocked || knowledge_view_entry.passthrough


    return <div>
        {(editing && knowledge_view_id && knowledge_view_entry && !knowledge_view_entry.blocked) && <FormControl component="fieldset" fullWidth={true} margin="normal">
                <FormLabel component="legend">Size</FormLabel>
                <Slider
                    color="secondary"
                    defaultValue={1}
                    marks
                    min={0.25} max={2}
                    onChange={(e: Event, val: number | number[]) =>
                    {
                        const size = Array.isArray(val) ? val[0] : val
                        upsert_entry(knowledge_view_id, { s: size })
                    }}
                    step={0.25}
                    value={knowledge_view_entry.s ? knowledge_view_entry.s : 1}
                    valueLabelDisplay="on"
                />
            </FormControl>
        }

        {editing && <p>
            <AlignComponentForm wcomponent_id={wcomponent_id} />
            <br />
        </p>}

        <div style={{ display: "inline-flex" }}>
            <MoveToWComponentButton
                wcomponent_id={wcomponent_id}
                // Maybe this should be true but I find it confusing behaviour when ... <todo fill in scenario>
                //
                // Maybe this should be false but I find it confusing behaviour when the component is not in the
                // current knowledge view, and you can press the button anyway and get taken to some random point with
                // other components... but then you (obviously) can not find this component so a user will be
                // left thinking: "Why did the button work?"  "What am I meant to see here?"  "Is this component
                // present I am just missing it?"  "Is the component perhaps hidden by another component?"
                disable_if_not_present={true}
            />

            <Box zIndex={10} m={4} class="node_handle">
                <ExploreButtonHandle
                    wcomponent_id={wcomponent_id}
                    wcomponent_current_kv_entry={composed_knowledge_view_entry}
                    is_highlighted={true}
                />
            </Box>
        </div>

        {/* {knowledge_view_entry && !wcomponent_is_plain_connection(wcomponent) && <div>
            Position:
            <EditablePosition point={knowledge_view_entry} on_update={update} />
        </div>} */}

        {knowledge_view_id && not_present && <div>
            {(knowledge_view_entry?.blocked ? "Deleted from" : "Not present in") + " this knowledge view"}
            {composed_knowledge_view_entry && !composed_knowledge_view_entry.blocked && " but is present in a foundational knowledge view"}
            <br />
            {editing && <Button
                value={(knowledge_view_entry?.blocked ? "Re-add" : "Add") + " to current knowledge view"}
                extra_class_names="left"
                onClick={() => upsert_entry(knowledge_view_id, { blocked: undefined, passthrough: undefined })}
            />}
        </div>}


        {(editing && knowledge_view_entry && !knowledge_view_entry.passthrough) && <div>
            <ConfirmatoryDeleteButton
                button_text="Delete from knowledge view (allow passthrough from foundations)"
                tooltip_text={"Delete from current knowledge view (" + knowledge_view_title + ") and allow passthrough from foundations"}
                on_delete={() =>
                {
                    props.bulk_remove_from_knowledge_view({
                        wcomponent_ids: [wcomponent_id],
                        remove_type: "passthrough",
                    })
                }}
            />
        </div>}


        {(editing && knowledge_view_entry && !knowledge_view_entry.blocked && !knowledge_view_entry.passthrough) && <div>
            <ConfirmatoryDeleteButton
                button_text="Block from knowledge view"
                tooltip_text={"Block from showing in current knowledge view (" + knowledge_view_title + ")"}
                on_delete={() =>
                {
                    props.bulk_remove_from_knowledge_view({
                        wcomponent_ids: [wcomponent_id],
                        remove_type: "block",
                    })
                }}
            />
        </div>}


        {editing && <p>
            Add to knowledge view
            <SelectKnowledgeView
                on_change={knowledge_view_id =>
                {
                    if (!knowledge_view_id) return

                    upsert_entry(knowledge_view_id)
                }}
            />
        </p>}


        {other_knowledge_views.length > 0 && <div>
            <br />
            {not_present ? "Present" : "Also"} in:
            {other_knowledge_views.map(kv =>
            {
                const entry = kv.wc_id_map[wcomponent_id]
                const pos = lefttop_to_xy(entry, true)

                return <div>
                    <Link
                        route={undefined}
                        sub_route={undefined}
                        item_id={undefined}
                        args={{ subview_id: kv.id, ...pos }}
                    >
                        {kv.title}
                    </Link>
                </div>
            })}
        </div>}

        <p>
            <WComponentBackReferences wcomponent_id={wcomponent_id} />
        </p>
    </div>
}

export const WComponentKnowledgeViewForm = connector(_WComponentKnowledgeViewForm) as FunctionalComponent<OwnProps>
