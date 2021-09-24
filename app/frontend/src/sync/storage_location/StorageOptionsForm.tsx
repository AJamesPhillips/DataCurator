import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "../common.scss"
import "./StorageOptionsForm.scss"
import { StorageOption } from "./StorageOption"
import type { SupabaseKnowledgeBaseWithAccess } from "../../supabase/interfaces"
import type { RootState } from "../../state/State"
import { ACTIONS } from "../../state/actions"



interface OwnProps
{
    chosen_base_id: number | undefined
    bases: SupabaseKnowledgeBaseWithAccess[] | undefined
    on_close: () => void
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

    if (!bases) return "No bases fetched"
    if (bases.length === 0) return "Fetched bases but you do not have any"


    return <div style={{ margin: 10 }}>
        {bases.map(base =>
            <StorageOption
                name={base.title || "(No title)"}
                description={<div />}
                selected={base.id === chosen_base_id}
                on_click={() =>
                {
                    update_chosen_base_id({ base_id: base.id })
                    on_close()
                }}
            />
        )}
    </div>
}

export const StorageOptionsForm = connector(_StorageOptionsForm) as FunctionalComponent<OwnProps>
