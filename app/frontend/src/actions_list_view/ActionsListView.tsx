import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./ActionsListView.scss"
import { MainArea } from "../layout/MainArea"
import { wcomponent_is_action } from "../wcomponent/interfaces/SpecialisedObjects"
import { get_current_composed_knowledge_view_from_state, get_wcomponents_from_ids } from "../state/specialised_objects/accessors"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import { PrioritisableAction } from "./PrioritisableAction"
import { SortDirection, sort_list } from "../shared/utils/sort"
import { get_created_at_ms } from "../shared/utils_datetime/utils_datetime"
import { selector_chosen_base_id } from "../state/user_info/selector"
import type { WComponentNodeAction } from "../wcomponent/interfaces/action"
import { get_wcomponent_state_value_and_probabilities } from "../wcomponent_derived/get_wcomponent_state_value"
import { ACTION_VALUE_POSSIBILITY_ID } from "../wcomponent/value/parse_value"
import type { Base } from "../shared/interfaces/base"
import { SIDE_PANEL_WIDTH } from "../side_panel/width"
import { useMemo, useRef, useState } from "preact/hooks"
import { AddNewActionButton } from "./AddNewActionButton"
import type { CanvasPoint, CanvasPointerEvent } from "../canvas/interfaces"



export function ActionsListView (props: {})
{
    return <MainArea
        main_content={<ActionsListViewContent />}
    />
}



const map_state = (state: RootState) =>
{
    const { wcomponents_by_id } = state.specialised_objects

    let action_ids: Set<string> | undefined = undefined

    const composed_knowledge_view = get_current_composed_knowledge_view_from_state(state)
    const filter_by_knowledge_view = false
    if (filter_by_knowledge_view)
    {
        if (composed_knowledge_view)
        {
            action_ids = composed_knowledge_view.wc_ids_by_type.action
        }
    }
    else action_ids = state.derived.wcomponent_ids_by_type.action


    return {
        composed_knowledge_view,
        action_ids,
        wcomponents_by_id,
        base_id: selector_chosen_base_id(state),
        display_side_panel: state.controls.display_side_panel,
    }
}


const map_dispatch = {
    upsert_wcomponent: ACTIONS.specialised_object.upsert_wcomponent,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _ActionsListViewContent (props: Props)
{
    const { composed_knowledge_view, action_ids, wcomponents_by_id, base_id } = props

    const [max_done_visible, set_max_done_visible] = useState(5)
    // pointer_down is the position on the user's physical screen
    const [pointer_down_at, set_pointer_down_at] = useState<undefined | CanvasPointerEvent>(undefined)
    const initial_scroll = useRef<undefined | CanvasPoint>(undefined)
    const action_list_view_content_el = useRef<undefined | HTMLElement>(undefined)


    if (base_id === undefined) return <div>No base id chosen</div> // type guard
    if (action_ids === undefined) return <div>No actions</div> // type guard


    const now = new Date().getTime()
    let actions = Array.from(action_ids).map(id => wcomponents_by_id[id])
        .filter(wcomponent_is_action)
    actions = sort_list(actions, get_modified_or_created_at, SortDirection.descending)


    const actions_icebox: WComponentNodeAction[] = []
    const actions_todo: WComponentNodeAction[] = []
    const actions_in_progress: WComponentNodeAction[] = []
    const actions_done_or_rejected: WComponentNodeAction[] = []

    actions.forEach(action =>
    {
        const attribute_values = get_wcomponent_state_value_and_probabilities({
            wcomponent: action,
            VAP_set_id_to_counterfactual_v2_map: {}, created_at_ms: now, sim_ms: now
        })

        const most_probable = attribute_values.most_probable_VAP_set_values[0]
        if (most_probable?.value_id === ACTION_VALUE_POSSIBILITY_ID.action_in_progress) actions_in_progress.push(action)
        else if (most_probable?.value_id === ACTION_VALUE_POSSIBILITY_ID.action_completed || most_probable?.value_id === ACTION_VALUE_POSSIBILITY_ID.action_rejected || most_probable?.value_id === ACTION_VALUE_POSSIBILITY_ID.action_failed)
        {
            actions_done_or_rejected.push(action)
        }
        else if (action.todo_index) actions_todo.push(action)
        else actions_icebox.push(action)
    })

    const hidden_done = actions_done_or_rejected.length - max_done_visible


    const sorted_actions_todo = sort_list(actions_todo, a => a.todo_index || 0, SortDirection.descending)


    const action_ids_for_current_kv = composed_knowledge_view?.wc_ids_by_type?.action
    const most_recent_action_id = useMemo(() =>
    {
        let actions_on_current_kv = get_wcomponents_from_ids(wcomponents_by_id, action_ids_for_current_kv)
            .filter(wcomponent_is_action)

        actions_on_current_kv = sort_list(actions_on_current_kv, get_created_at_ms, SortDirection.descending)
        const most_recent_action_id = (actions_on_current_kv || [])[0]?.id || ""

        return most_recent_action_id
    }, [action_ids_for_current_kv])


    return <div
        className={`action_list_view_content ${pointer_down_at === undefined ? "" : "moving"}`}
        ref={e => action_list_view_content_el.current = (e || undefined)}
        onPointerDown={e => {
            // e.preventDefault() // was to prevent selecting text but it also stops the click from
            // triggering the close event on the drop down menus used for the knowledge view breadcrumb
            const el = action_list_view_content_el.current
            if (!el) return

            set_pointer_down_at({ x: e.clientX, y: e.clientY })
            initial_scroll.current = { left: el.scrollLeft, top: el.scrollTop }
        }}
        onPointerMove={e =>
        {
            if (pointer_down_at === undefined) return
            if (initial_scroll.current === undefined) return
            if (!action_list_view_content_el.current) return

            const left = initial_scroll.current.left - (e.clientX - pointer_down_at.x)
            const top = initial_scroll.current.top - (e.clientY - pointer_down_at.y)
            action_list_view_content_el.current.scroll(left, top)
        }}
        onPointerUp={e => set_pointer_down_at(undefined)}
        onPointerLeave={e => set_pointer_down_at(undefined)}
        onPointerOut={e =>
        {
            let target: HTMLElement | null = e.relatedTarget as HTMLElement
            while (target)
            {
                const { classList } = target
                if (classList && (classList.contains("action_list") || classList.contains("action_list_view_content")))
                {
                    return
                }
                target = target.parentElement
            }
            set_pointer_down_at(undefined)
        }}
    >
        <div className="action_list icebox">
            <h1>Icebox
                <AddNewActionButton
                    list_type="icebox"
                    most_recent_action_id={most_recent_action_id}
                    composed_knowledge_view={composed_knowledge_view}
                    wcomponents_by_id={wcomponents_by_id}
                    base_id={base_id}
                />
            </h1>

            {actions_icebox.map(action => <PrioritisableAction
                key={action.id}
                action={action}
                show_icebox_actions={true}
            />)}
        </div>


        <div className="action_list todo">
            <h1>Todo
                <AddNewActionButton
                    list_type="todo"
                    most_recent_action_id={most_recent_action_id}
                    composed_knowledge_view={composed_knowledge_view}
                    wcomponents_by_id={wcomponents_by_id}
                    base_id={base_id}
                />
            </h1>

            {sorted_actions_todo.map(action => <PrioritisableAction
                key={action.id}
                action={action}
                show_todo_actions={true}
            />)}
        </div>


        <div className="action_list in_progress">
            <h1>In progress
                <AddNewActionButton
                    list_type="in_progress"
                    most_recent_action_id={most_recent_action_id}
                    composed_knowledge_view={composed_knowledge_view}
                    wcomponents_by_id={wcomponents_by_id}
                    base_id={base_id}
                />
            </h1>

            {actions_in_progress.map(action => <PrioritisableAction
                key={action.id}
                action={action}
            />)}
        </div>


        <div className="action_list done_or_rejected">
            <h1>Done
                <AddNewActionButton
                    list_type="done"
                    most_recent_action_id={most_recent_action_id}
                    composed_knowledge_view={composed_knowledge_view}
                    wcomponents_by_id={wcomponents_by_id}
                    base_id={base_id}
                />
            </h1>

            {actions_done_or_rejected.slice(0, max_done_visible).map(action => <PrioritisableAction
                key={action.id}
                action={action}
            />)}

            {hidden_done > 0 && <div
                style={{ textAlign: "center", margin: 40, cursor: "pointer" }}
                onClick={() => set_max_done_visible(max_done_visible + 50)}
            >
                ... {hidden_done} hidden ...
            </div>}
        </div>


        <div
            className="side_panel_padding"
            style={{ minWidth: props.display_side_panel ? SIDE_PANEL_WIDTH : 0 }}
        />
    </div>
}

const ActionsListViewContent = connector(_ActionsListViewContent) as FunctionalComponent<{}>



function get_modified_or_created_at (a: Base)
{
    if (a.modified_at) return a.modified_at.getTime()

    return get_created_at_ms(a)
}
