import { describe, test } from "../../shared/utils/test"
import { cloneable_generator_factory } from "../../utils/generators"
import { random_int } from "../../utils/random"
import { prepare_new_contextless_wcomponent_object } from "../../wcomponent/CRUD_helpers/prepare_new_wcomponent_object"
import type { WComponentNodeAction } from "../../wcomponent/interfaces/action"
import type { WComponentNodeGoal } from "../../wcomponent/interfaces/goal"
import {
    WComponentsById,
    wcomponent_is_action,
    wcomponent_is_goal,
} from "../../wcomponent/interfaces/SpecialisedObjects"



interface PrepareArgsForActionsParentIdsArgs
{
    all_action_ids: Set<string>
    all_goal_ids: Set<string>
    wcomponents_by_id: WComponentsById
}
export function prepare_args_for_actions_parent_ids (args: PrepareArgsForActionsParentIdsArgs)
{
    const { all_action_ids, all_goal_ids, wcomponents_by_id } = args


    const actions = Array.from(all_action_ids)
        .map(id => wcomponents_by_id[id])
        .filter(wcomponent_is_action)
    const actions_by_id: {[id: string]: WComponentNodeAction} = {}
    actions.forEach(action => actions_by_id[action.id] = action)


    const goals = Array.from(all_goal_ids)
        .map(id => wcomponents_by_id[id])
        .filter(wcomponent_is_goal)
    const goals_by_id: {[id: string]: WComponentNodeGoal} = {}
    goals.forEach(goal => goals_by_id[goal.id] = goal)


    return { actions_by_id, goals_by_id }
}



interface ActionsParentIdsArgs {
    action: WComponentNodeAction
    actions_by_id: {[id: string]: WComponentNodeAction}
    goals_by_id: {[id: string]: WComponentNodeGoal}
}
// Will return the action's own id as the first id. This is done because
// the action might itself be a prioritised action/goal, i.e. it might be its own parent.
export function* get_actions_parent_ids (args: ActionsParentIdsArgs): Generator<string, string | undefined, boolean | undefined>
{
    const { action, actions_by_id, goals_by_id } = args


    let parent: WComponentNodeAction | WComponentNodeGoal = action
    let parent_goal_or_action_ids: string[] = []
    let parent_goal_or_action_ids_already_seen = new Set<string>([parent.id])

    while (true)
    {
        // Add this action/goal's parent_goal_or_action_ids to the list, assuming they have not already been seen
        ;(parent.parent_goal_or_action_ids || []).forEach(id =>
        {
            if (parent_goal_or_action_ids_already_seen.has(id))
            {
                console.warn(`Parent action/goal id already seen: "${id}".  May be circular, may just be a common ancestor.`)
                return
            }
            parent_goal_or_action_ids_already_seen.add(id)
            const exists = actions_by_id[id] || goals_by_id[id]
            if (!exists)
            {
                console .log(`Parent goal or action for id "${id}" not found.  Might be from another base?`)
                // TODO support goals and actions from other bases
                return
            }
            parent_goal_or_action_ids.push(id)
        })

        const has_valid_parents = parent_goal_or_action_ids.length > 0

        const consumed_last_id = yield parent.id
        if (consumed_last_id || !has_valid_parents) return undefined

        const next_parent_id = parent_goal_or_action_ids.shift()
        if (!next_parent_id) return undefined

        const next_parent = actions_by_id[next_parent_id] || goals_by_id[next_parent_id]
        if (!next_parent) return undefined // type guard
        parent = next_parent
    }
}



export const test_get_actions_parent_ids = describe.delay("get_actions_parent_ids", () =>
{
    function helper_func__make_goal (title: string, parent_goal_or_action_ids: string[] = [])
    {
        return prepare_new_contextless_wcomponent_object({
            type: "goal",
            base_id: -1,
            title,
            id: title + ` ${random_int(4)}`,
            parent_goal_or_action_ids,
        }) as WComponentNodeGoal
    }


    function helper_func__make_action (title: string, parent_goal_or_action_ids: string[] = [])
    {
        return prepare_new_contextless_wcomponent_object({
            type: "action",
            base_id: -1,
            title,
            id: title + ` ${random_int(4)}`,
            parent_goal_or_action_ids,
        }) as WComponentNodeAction
    }


    function helper_func__get_derived_state (wcomponents: (WComponentNodeAction | WComponentNodeGoal)[])
    {
        const wcomponents_by_id: WComponentsById = {}
        const all_action_ids = new Set<string>()
        const all_goal_ids = new Set<string>()

        wcomponents.forEach(wc =>
        {
            wcomponents_by_id[wc.id] = wc
            if (wc.type === "action") all_action_ids.add(wc.id)
            else all_goal_ids.add(wc.id)
        })

        return prepare_args_for_actions_parent_ids({ all_action_ids, all_goal_ids, wcomponents_by_id })
    }


    function helper_func__get_cloneable_actions_parent_ids (action: WComponentNodeAction, all_actions_and_goals: (WComponentNodeAction | WComponentNodeGoal)[])
    {
        const args: ActionsParentIdsArgs =
        {
            action,
            ...helper_func__get_derived_state(all_actions_and_goals)
        }
        return cloneable_generator_factory(args, get_actions_parent_ids)
    }



    describe("No parents only self", () =>
    {
        const action0 = helper_func__make_action("action0", [])
        const actions_parent_ids = helper_func__get_cloneable_actions_parent_ids(action0, [action0])

        const result = actions_parent_ids.next()
        test(result.value, action0.id, "Should return own id")
        test(result.done, false, "Should have no more ids")
    })



    describe("Branching parents grandparents", () =>
    {
        const goal1 = helper_func__make_goal("goal1")
        const goal2 = helper_func__make_goal("goal2")
        const goal3 = helper_func__make_goal("goal3")
        const subgoal2_3 = helper_func__make_goal("subgoal2&3", [goal2.id, goal3.id])
        const action1 = helper_func__make_action("action1", [goal1.id, subgoal2_3.id])

        let actions_parent_ids = helper_func__get_cloneable_actions_parent_ids(action1, [
            action1,
            goal1,
            goal2,
            goal3,
            subgoal2_3,
        ])

        let result = actions_parent_ids.next()
        test(result.value, action1.id, "Should return own id")
        test(result.done, false, "Should have more ids ready")

        let saved_actions_parent_ids = actions_parent_ids.clone()

        result = actions_parent_ids.next(true) // true === id was consumed
        test(result.value, undefined, "Should return nothing when last id was own id and was also consumed")
        test(result.done, true, "Should have no more ids ready when last id was own id and was also consumed")


        actions_parent_ids = saved_actions_parent_ids

        result = actions_parent_ids.next(false) // false === id was not consumed
        test(result.value, goal1.id, "Should return next parent id, when last was own id and was not consumed")

        saved_actions_parent_ids = actions_parent_ids.clone()

        result = actions_parent_ids.next(true) // true === id was consumed
        test(result.value, undefined, "Should return nothing when last id was consumed")
        test(result.done, true, "Should have no more ids ready when last id was consumed")


        actions_parent_ids = saved_actions_parent_ids

        result = actions_parent_ids.next(false) // false === id was not consumed
        test(result.value, subgoal2_3.id, "Should return next parent id, when last was not consumed but there is a sibling id")

        saved_actions_parent_ids = actions_parent_ids.clone()

        result = actions_parent_ids.next(true) // true === id was consumed
        test(result.value, undefined, "Should return nothing when last id was consumed")
        test(result.done, true, "Should have no more ids ready when last id was consumed")


        actions_parent_ids = saved_actions_parent_ids

        result = actions_parent_ids.next(false) // false === id was not consumed
        test(result.value, goal2.id, "Should return next parent id, when last was not consumed but there is a grandparent")

        saved_actions_parent_ids = actions_parent_ids.clone()

        result = actions_parent_ids.next(true) // true === id was consumed
        test(result.value, undefined, "Should return nothing when last id was consumed")
        test(result.done, true, "Should have no more ids ready when last id was consumed")


        actions_parent_ids = saved_actions_parent_ids

        result = actions_parent_ids.next(false) // false === id was not consumed
        test(result.value, goal3.id, "Should return next parent id, when last was not consumed and there is a grandparent sibling")

        saved_actions_parent_ids = actions_parent_ids.clone()

        result = actions_parent_ids.next(true) // true === id was consumed
        test(result.value, undefined, "Should return nothing when last id was consumed")
        test(result.done, true, "Should have no more ids ready when last id was consumed")


        actions_parent_ids = saved_actions_parent_ids

        result = actions_parent_ids.next(false) // false === id was not consumed
        test(result.value, undefined, "Should return undefined when exhausted parent and grandparent ids")
        test(result.done, true, "Should have no more ids")
    })




    describe("get_actions_parent_ids should work if parents are also actions, and not just for parents that are goals", () =>
    {
        const action1 = helper_func__make_action("action1")
        const action2 = helper_func__make_action("action2")
        const action3 = helper_func__make_action("action3")
        const subaction2_3 = helper_func__make_action("subaction2&3", [action2.id, action3.id])
        const action4 = helper_func__make_action("action1", [action1.id, subaction2_3.id])

        let actions_parent_ids = helper_func__get_cloneable_actions_parent_ids(action4, [
            action1,
            action2,
            action3,
            subaction2_3,
            action4,
        ])

        let result = actions_parent_ids.next()
        test(result.value, action4.id, "Should return own id")

        result = actions_parent_ids.next()
        test(result.value, action1.id, "Should return next id")

        result = actions_parent_ids.next()
        test(result.value, subaction2_3.id, "Should return next id")

        result = actions_parent_ids.next()
        test(result.value, action2.id, "Should return next id")

        result = actions_parent_ids.next()
        test(result.value, action3.id, "Should return next id")

        result = actions_parent_ids.next()
        test(result.value, undefined, "Should return no more ids")
        test(result.done, true, "Should be done")
    })



    describe("Circular parents", () =>
    {
        const goal1 = helper_func__make_goal("goal1")
        const action1 = helper_func__make_action("action1", [goal1.id])
        goal1.parent_goal_or_action_ids = [action1.id]
        const action2 = helper_func__make_action("action2", [goal1.id])

        let actions_parent_ids = helper_func__get_cloneable_actions_parent_ids(action2, [
            action1,
            action2,
            goal1,
        ])

        let result = actions_parent_ids.next()
        test(result.value, action2.id, "Should return own id")
        test(result.done, false, "Should have more ids ready")

        result = actions_parent_ids.next()
        test(result.value, goal1.id, "Should return next id")
        test(result.done, false, "Should have more ids ready")

        result = actions_parent_ids.next()
        test(result.value, action1.id, "Should return next id")
        test(result.done, false, "Should have not finished")
        result = actions_parent_ids.next()
        test(result.done, true, "Should have finished")
    })



    describe("Spread iterator containing one parent", () =>
    {
        const goal1 = helper_func__make_goal("goal1")
        const action1 = helper_func__make_action("action1", [goal1.id])

        const actions_parent_ids = helper_func__get_cloneable_actions_parent_ids(action1, [
            action1,
            goal1,
        ])

        const result = [...actions_parent_ids]
        test(result, [action1.id, goal1.id], "Should return both ids")
    })


})
