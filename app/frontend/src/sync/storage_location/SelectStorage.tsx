import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import type { RootState } from "../../state/State"
import { Modal } from "../../modal/Modal"
import { StorageOptionsForm } from "./StorageOptionsForm"



interface OwnProps
{
    on_close: () => void
}


const map_state = (state: RootState) =>
{
    return {
        chosen_base_id: state.user_info.chosen_base_id,
        bases: state.user_info.bases,
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _SelectStorage (props: Props)
{
    return <Modal
        title={<div style={{ margin: 10 }}>
            <h2 style={{ display: "inline" }}>Base</h2>
        </div>}
        size="medium"

        on_close={e =>
        {
            e?.stopImmediatePropagation()
            props.on_close()
        }}


        child={<StorageOptionsForm
            chosen_base_id={props.chosen_base_id}
            bases={props.bases}
            on_close={props.on_close}
        />}
    />
}

export const SelectStorage = connector(_SelectStorage) as FunctionalComponent<OwnProps>
