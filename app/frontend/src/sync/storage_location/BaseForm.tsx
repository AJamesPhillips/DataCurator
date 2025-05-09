import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { BaseFormEditSharing } from "../../access_controls/BaseFormEditSharing"
import type { RootState } from "../../state/State"
import type { SupabaseKnowledgeBaseWithAccess } from "../../supabase/interfaces"
import "../common.scss"
import { BaseFormEditFields } from "./BaseFormEditFields"



interface OwnProps
{
    base: SupabaseKnowledgeBaseWithAccess
    on_save_or_exit: () => void
}



const map_state = (state: RootState) =>
{
    return {
        user: state.user_info.user,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _BaseForm (props: Props)
{
    const { base, on_save_or_exit, user } = props

    if (!user) return "Please sign in"

    return <div style={{ margin: 10 }}>
        <BaseFormEditFields user={user} base={base} on_save_or_exit={on_save_or_exit} />

        <BaseFormEditSharing user={user} base={base} on_save_or_exit={on_save_or_exit} />
    </div>
}

export const BaseForm = connector(_BaseForm) as FunctionalComponent<OwnProps>
