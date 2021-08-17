import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../../state/actions"
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
        storage_type: state.sync.storage_type,
    }
}

const map_dispatch = {
    update_storage_type: ACTIONS.sync.update_storage_type,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _SelectStorageType (props: Props)
{
    const initial_storage_type_defined = props.storage_type !== undefined


    return <Modal
        title={<div style={{ margin: 10 }}>
            <h2 style={{ display: "inline" }}>Where would you like to store your data?</h2>
            <span>&nbsp; (You can change this at any time)</span>
        </div>}
        size="medium"

        // When there is not yet an initial_storage_type_defined, do not give the Modal a close function.
        // If we don't give the Modal an on_close function, it prevents the Modal from being closed
        // by the user before they choose & confirm a storage_type
        on_close={!initial_storage_type_defined ? undefined : e =>
        {
            e?.stopImmediatePropagation()
            props.on_close()
        }}


        child={<StorageOptionsForm
            initial_storage_type_defined={initial_storage_type_defined}
            storage_type={props.storage_type}
            on_close={props.on_close}
            update_storage_type={storage_type => props.update_storage_type({ storage_type })}
        />}
    />
}

export const SelectStorageType = connector(_SelectStorageType) as FunctionalComponent<OwnProps>
