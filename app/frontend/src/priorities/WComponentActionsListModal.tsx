import { FunctionalComponent } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Modal } from "../modal/Modal"
import { date2str } from "../shared/utils/date_helpers"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"
import { WComponentsList } from "./WComponentsList"



const map_state = (state: RootState) =>
({
    action_ids_to_show: state.view_priorities.action_ids_to_show,
    date_shown: state.view_priorities.date_shown,
})


const map_dispatch = {
    set_action_ids_to_show: ACTIONS.view_priorities.set_action_ids_to_show,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>


function _WComponentActionsListModal (props: Props)
{
    if (props.action_ids_to_show.length === 0) return null

    let title = "Actions"
    if (props.date_shown) title += ` (${date2str(props.date_shown, "yyyy-MMM-dd")})`

    return <Modal
        on_close={() => props.set_action_ids_to_show({ action_ids: [] })}
        title={title}
        child={<WComponentsList wcomponent_ids={props.action_ids_to_show} />}
    />
}

export const WComponentActionsListModal = connector(_WComponentActionsListModal) as FunctionalComponent<{}>
