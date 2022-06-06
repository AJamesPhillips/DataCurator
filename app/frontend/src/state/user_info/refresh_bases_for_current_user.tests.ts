import { test } from "../../shared/utils/test"
import type {
    SupabaseKnowledgeBaseWithAccess,
} from "../../supabase/interfaces"
import { ACTIONS } from "../actions"
import type { RootState } from "../State"
import { user_info_reducer } from "./reducer"
import { selector_needs_to_create_a_base } from "./selector"
import type { UserInfoState } from "./state"



export function run_tests ()
{
    const inserted_at = new Date()
    const updated_at = new Date()
    const user_id = "123"
    const other_user_id = "987"

    const an_owned_base: SupabaseKnowledgeBaseWithAccess = {
        id: 1, inserted_at, updated_at, owner_user_id: user_id, public_read: false, title: "owned by this user",
        access_level: "owner",
        can_edit: true,
        knowledge_view_tree: {},
    }
    const a_base_with_editor_access: SupabaseKnowledgeBaseWithAccess = {
        id: 2, inserted_at, updated_at, owner_user_id: other_user_id, public_read: false, title: "editable by this user",
        access_level: "editor",
        can_edit: true,
        knowledge_view_tree: {},
    }
    const a_base_with_viewer_access: SupabaseKnowledgeBaseWithAccess = {
        id: 3, inserted_at, updated_at, owner_user_id: other_user_id, public_read: false, title: "viewable by this user",
        access_level: "viewer",
        can_edit: false,
        knowledge_view_tree: {},
    }
    const a_public_base: SupabaseKnowledgeBaseWithAccess = {
        id: 3, inserted_at, updated_at, owner_user_id: other_user_id, public_read: true, title: "public viewable by this user",
        access_level: "viewer",
        can_edit: false,
        knowledge_view_tree: {},
    }
    const bases = [
        an_owned_base,
        a_base_with_editor_access,
        a_base_with_viewer_access,
        a_public_base,
    ]


    function wrapped_selector_needs_to_create_a_base (user_info: Partial<UserInfoState>)
    {
        const state = { user_info } as RootState
        return selector_needs_to_create_a_base(state)
    }


    // User arrives with no chosen_base_id in the URL and No bases yet
    let user_info: Partial<UserInfoState> = {
        user: { id: user_id } as any,
        chosen_base_id: undefined,
        bases_by_id: undefined,
    }
    test(wrapped_selector_needs_to_create_a_base(user_info), false)


    // User then loads bases and has:
    //   * one which they own
    //   * one which they can edit
    ;[an_owned_base, a_base_with_editor_access].forEach(base =>
    {
        user_info = user_info_reducer(
            { user_info } as RootState,
            ACTIONS.user_info.update_bases({ bases: [base] })
        ).user_info
        // should have selected a valid base_id and this base will be editable
        test(user_info.chosen_base_id, base.id)
        test(wrapped_selector_needs_to_create_a_base(user_info), false)
    })


    // User loads bases and has two which they can view
    user_info = user_info_reducer(
        { user_info } as RootState,
        ACTIONS.user_info.update_bases({ bases: [a_base_with_viewer_access, a_public_base] })
    ).user_info
    // should not have changed or selected a base_id
    test(user_info.chosen_base_id, undefined)
    // should need to create a base
    test(wrapped_selector_needs_to_create_a_base(user_info), true)



    // User arrives with an invalid chosen_base_id in the URL and has only readable bases
    user_info = user_info_reducer(
        {
            user_info: {
                user: { id: user_id } as any,
                chosen_base_id: 100,
                bases_by_id: undefined,
            }
        } as RootState,
        ACTIONS.user_info.update_bases({ bases: [a_base_with_viewer_access, a_public_base] })
    ).user_info
    // should have changed chosen_base_id to undefined
    test(user_info.chosen_base_id, undefined)
    test(wrapped_selector_needs_to_create_a_base(user_info), true)



    // User arrives with an invalid chosen_base_id in the URL but has editable base
    ;[an_owned_base, a_base_with_editor_access].forEach(base =>
    {
        user_info = user_info_reducer(
            {
                user_info: {
                    user: { id: user_id } as any,
                    chosen_base_id: 100,
                    bases_by_id: undefined,
                }
            } as RootState,
            ACTIONS.user_info.update_bases({ bases: [] })
        ).user_info
        // should have changed chosen_base_id to undefined
        test(user_info.chosen_base_id, undefined)
        test(wrapped_selector_needs_to_create_a_base(user_info), true)
    })



    // User arrives with a chosen_base_id in the URL that's valid
    bases.forEach(({ id }) =>
    {
        user_info = user_info_reducer(
            {
                user_info: {
                    user: { id: user_id } as any,
                    chosen_base_id: id,
                    bases_by_id: undefined,
                }
            } as RootState,
            ACTIONS.user_info.update_bases({ bases })
        ).user_info
        // should have not have changed chosen_base_id
        test(user_info.chosen_base_id, id)
        test(wrapped_selector_needs_to_create_a_base(user_info), false)
    })




    // // User loads bases and has two which they can view
    // user_info = user_info_reducer(
    //     { user_info } as RootState,
    //     ACTIONS.user_info.update_bases({ bases: [a_base_with_viewer_access] })
    // ).user_info
    // // should not have changed or selected a base_id
    // test(user_info.chosen_base_id, undefined)
    // // should need to create a base
    // test(wrapped_selector_needs_to_create_a_base(user_info), true)
}


// run_tests()
