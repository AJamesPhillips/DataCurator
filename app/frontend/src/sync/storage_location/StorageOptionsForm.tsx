import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "../common.scss"
import "./StorageOptionsForm.scss"
import { StorageOption } from "./StorageOption"
import type { SupabaseKnowledgeBaseWithAccess } from "../../supabase/interfaces"
import type { RootState } from "../../state/State"
import { ACTIONS } from "../../state/actions"
import { useState } from "preact/hooks"



interface OwnProps
{
    chosen_base_id: number | undefined
    bases: SupabaseKnowledgeBaseWithAccess[] | undefined
    on_close?: () => void
}



const map_state = (state: RootState) =>
{
    return {
        chosen_base_id: state.user_info.chosen_base_id,
        bases: state.user_info.bases,
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
    const { on_close, chosen_base_id, bases, update_chosen_base_id } = props

    const [new_base_name, set_new_base_name] = useState("")

    if (!bases) return "No bases fetched"


    function create_base ()
    {

    }


    return <div style={{ margin: 10 }}>
        {bases.length > 0 && <h4>
            Select an existing base
        </h4>}

        {bases.map(base =>
            <StorageOption
                name={base.title || "(No title)"}
                description={<div />}
                selected={base.id === chosen_base_id}
                on_click={() =>
                {
                    update_chosen_base_id({ base_id: base.id })
                    on_close && on_close()
                }}
            />
        )}

        <hr />

        <h4>
            Create {bases.length > 0 ? "a new" : "your first" } base
        </h4>

        <input type="text" value={new_base_name}
            onKeyUp={e => set_new_base_name(e.currentTarget.value)}
            onChange={e => set_new_base_name(e.currentTarget.value)}
            onBlur={e => set_new_base_name(e.currentTarget.value)}
        /><br />
        <input
            type="button"
            disabled={!new_base_name}
            onClick={e => create_base()}
            value="Create new base"
        />
    </div>
}

export const StorageOptionsForm = connector(_StorageOptionsForm) as FunctionalComponent<OwnProps>
