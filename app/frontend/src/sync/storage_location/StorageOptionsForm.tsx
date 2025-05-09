import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { useState } from "preact/hooks"
import type { RootState } from "../../state/State"
import { ACTIONS } from "../../state/actions"
import { pub_sub } from "../../state/pub_sub/pub_sub"
import { create_a_base } from "../../supabase/bases"
import type { SupabaseKnowledgeBase } from "../../supabase/interfaces"
import type { AsyncState } from "../../utils/async_state"
import "../common.scss"
import { AvailableBases } from "./AvailableBases"
import { BaseForm } from "./BaseForm"



interface OwnProps
{
    on_close?: () => void
}



const map_state = (state: RootState) =>
{
    return {
        user: state.user_info.user,
        users_by_id: state.user_info.users_by_id,
        bases_by_id: state.user_info.bases_by_id,
    }
}

const map_dispatch = {
    update_chosen_base_id: ACTIONS.user_info.update_chosen_base_id,
    // update_bases: ACTIONS.user_info.update_bases,
}

const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _StorageOptionsForm (props: Props)
{
    const { on_close, user, users_by_id, bases_by_id, update_chosen_base_id } = props

    const [new_base_title, set_new_base_title] = useState("")
    const [base_creation_state, set_base_creation_state] = useState<AsyncState>("initial")
    const [editing_base_id, set_editing_base_id] = useState<number | undefined>(undefined)
    const [newly_created_base, set_newly_created_base] = useState<SupabaseKnowledgeBase | undefined>(undefined)


    if (!users_by_id) return "Loading users..."
    if (!bases_by_id) return "Loading bases..."


    const user_id = user?.id
    const base_count = Object.keys(bases_by_id).length


    const create_base = user_id === undefined ? undefined : async function ()
    {
        set_base_creation_state("in_progress")
        const res = await create_a_base({ owner_user_id: user_id, title: new_base_title.trim() })

        set_base_creation_state(res.error ? "error" : "success")
        set_newly_created_base(res.base)
        if (!res.error)
        {
            pub_sub.user.pub("stale_bases", false)
            set_new_base_title("")
        }
    }


    if (editing_base_id !== undefined) return <div style={{ margin: 10 }}>
        <BaseForm
            base={bases_by_id[editing_base_id]!}
            on_save_or_exit={() => set_editing_base_id(undefined)}
        />
    </div>


    return <div style={{ margin: 10 }}>
        <AvailableBases on_choose={on_close} on_click_edit={base_id => set_editing_base_id(base_id)} />

        {base_count > 0 && create_base && <hr />}

        {create_base && <div>
            <h4>
                Create {base_count ? "a new" : "your first" } base
            </h4>

            <input type="text" value={new_base_title}
                onKeyUp={e => set_new_base_title(e.currentTarget.value)}
                onChange={e => set_new_base_title(e.currentTarget.value)}
                onBlur={e => set_new_base_title(e.currentTarget.value)}
            /><br />
            <input
                type="button"
                disabled={!(new_base_title.trim()) || base_creation_state === "in_progress"}
                onClick={create_base}
                value="Create new base"
            /> &nbsp;

            {async_status_to_text(base_creation_state)} &nbsp;

            {newly_created_base && <input
                type="button"
                onClick={() =>
                {
                    update_chosen_base_id({ base_id: newly_created_base.id })
                    if (on_close) on_close()
                }}
                value="Select new base"
            />}
        </div>}

    </div>
}

export const StorageOptionsForm = connector(_StorageOptionsForm) as FunctionalComponent<OwnProps>



function async_status_to_text (status: AsyncState)
{
    if (status === "initial") return ""
    else if (status === "in_progress") return "Creating..."
    else if (status === "success") return "Created."
    else return "Error"
}
