import { FunctionalComponent, h } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"
import { ButtonGroup } from "@material-ui/core"

import "./SelectStorageType.scss"
import { Modal } from "../modal/Modal"
import { StorageOption } from "./StorageOption"
import { CONTACT_EMAIL_ADDRESS_TAG } from "../constants"
import { Button } from "../sharedf/Button"
import type { RootState } from "../state/State"
import { ACTIONS } from "../state/actions"
import { get_storage_type_name } from "./utils"
import { ConfirmatoryButton } from "../form/ConfirmatoryButton"
import { WarningTriangle } from "../sharedf/WarningTriangle"



interface OwnProps
{
    on_close: (e?: h.JSX.TargetedMouseEvent<HTMLDivElement>) => void
}


const map_state = (state: RootState) =>
{
    const storage_type = state.sync.storage_type

    return { storage_type }
}

const map_dispatch = {
    update_storage_type: ACTIONS.sync.update_storage_type,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector> & OwnProps



function _SelectStorageType (props: Props)
{
    const [show_advanced, set_show_advanced] = useState(props.storage_type === "local_server")
    const [storage_type, set_storage_type] = useState(props.storage_type)
    const [copy_data, set_copy_data] = useState(false)

    const valid_storage_type = storage_type !== undefined
    const initial_storage_type_defined = props.storage_type !== undefined
    const changed_storage_type = initial_storage_type_defined && props.storage_type !== storage_type

    const show_warning = changed_storage_type && !copy_data
    const show_danger_warning = changed_storage_type && copy_data
    const show_single_confirm_button = valid_storage_type && !copy_data
    const show_double_confirm_button = valid_storage_type && copy_data


    const initial_storage_name = get_storage_type_name(props.storage_type)
    const new_storage_name = get_storage_type_name(storage_type)


    return <Modal
        title={<div style={{ margin: 10 }}>
            <h2 style={{ display: "inline" }}>Where would you like to store your data?</h2>
            <span>&nbsp; (You can change this at any time)</span>
        </div>}
        size="medium"
        on_close={e => props.on_close(e)}

        child={() => <div style={{ margin: 10 }}>

            <StorageOption
                name={get_storage_type_name("local_storage")}
                description={<div>
                    The data is stored in your web browser. It never leaves your web browser. It is not available
                    in other web browsers, or on other computers. If you work in an incognito window you data will
                    be lost. If you clear you cache &amp; cookies your data will be lost. We recommend using this
                    for temporary demos <s>or if you are going to export to a file and reimport it after every
                    use</s> [feature not supported yet].
                </div>}
                selected={storage_type === "local_storage"}
                on_click={() => set_storage_type("local_storage")}
            />


            <StorageOption
                name={get_storage_type_name("solid")}
                description={<div>
                    Solid is a data storage platform which puts you back in control of your
                    data.  Once you retake ownership of your own data it enables you to use your data
                    with any other application and do useful things;
                    something the big tech companies don't let you do.
                    Sign up for a free account here:
                    &nbsp; <a href="https://solidcommunity.net/" target="_blank">solidcommunity.net</a>
                    &nbsp; or here:
                    &nbsp; <a href="https://signup.pod.inrupt.com/" target="_blank">inrupt.com</a>
                </div>}
                selected={storage_type === "solid"}
                on_click={() => set_storage_type("solid")}
            />


            <div
                className="storage_option_section advanced_options_title"
                onClick={() => set_show_advanced(!show_advanced)}
            >
                <span style={{ fontSize: 10 }}>{show_advanced ? "\u25BC" : "\u25B6"}</span>
                &nbsp;{show_advanced ? "Hide" : "Show"} advanced options
            </div>


            {show_advanced && <StorageOption
                name={get_storage_type_name("local_server")}
                description={<div>
                    You will need to be running your local data curator server at localhost:4000 to use this option successfully. If you choose this option we assume you know what you are doing and have a copy of the code base. If not, please contact {CONTACT_EMAIL_ADDRESS_TAG}
                </div>}
                selected={storage_type === "local_server"}
                on_click={() => set_storage_type("local_server")}
            />}


            {(show_warning || show_danger_warning) && <div
                className={`storage_option_section ${show_warning ? "warning" : "danger"}`}
            >
                <WarningTriangle message="" backgroundColor={show_warning ? "" : "red"} />&nbsp;
                Swapping to a new data store ({new_storage_name}) will leave behind your
                current data (in {initial_storage_name}).
                To copy your current data to the new storage location please check this box

                &nbsp;<input type="checkbox" checked={copy_data} onClick={e =>
                {
                    e.stopImmediatePropagation()
                    set_copy_data(!copy_data)
                }} />&nbsp;

                {show_danger_warning && <div>
                    DANGER: you may overwrite some or all of the current data
                    in '{new_storage_name}' with the data in '{initial_storage_name}'.
                </div>}
            </div>}


            <ButtonGroup size="small" color="primary" variant="contained" fullWidth={true}  disableElevation={true}>
                {show_single_confirm_button && <Button
                    value="Confirm"
                    onClick={e =>
                    {
                        e.stopImmediatePropagation()
                        storage_type && props.update_storage_type({ storage_type })
                        props.on_close()
                    }}
                />}


                {show_double_confirm_button && <ConfirmatoryButton
                    button_text="Confirm"
                    on_click={() =>
                    {
                        storage_type && props.update_storage_type({ storage_type })
                        props.on_close()
                    }}
                />}


                {valid_storage_type && <Button
                    value="Cancel"
                    onClick={e =>
                    {
                        e.stopImmediatePropagation()
                        props.on_close()
                    }}
                />}
            </ButtonGroup>

        </div>}
    />
}

export const SelectStorageType = connector(_SelectStorageType) as FunctionalComponent<OwnProps>
