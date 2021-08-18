import { h } from "preact"
import { useState } from "preact/hooks"
import { ButtonGroup } from "@material-ui/core"

import "../common.scss"
import "./StorageOptionsForm.scss"
import { CONTACT_EMAIL_ADDRESS_TAG } from "../../constants"
import { ConfirmatoryButton } from "../../form/ConfirmatoryButton"
import { WarningTriangle } from "../../sharedf/WarningTriangle"
import type { StorageType } from "../../state/sync/state"
import { get_storage_type_name } from "./get_storage_type_name"
import { StorageOption } from "./StorageOption"
import { Button } from "../../sharedf/Button"
import { change_storage_type } from "../../state/sync/utils/change_storage_type"



interface OwnProps
{
    storage_type: StorageType | undefined
    on_close: () => void
}

export function StorageOptionsForm (props: OwnProps)
{
    const { storage_type: initial_storage_type } = props

    const [show_advanced, set_show_advanced] = useState(initial_storage_type === "local_server")
    const [new_storage_type, set_new_storage_type] = useState(initial_storage_type)
    const [copy_data, set_copy_data] = useState(false)

    const copy_from: StorageType | false = (copy_data && is_initial_storage_type_defined(initial_storage_type)) ? initial_storage_type : false

    const valid_storage_type = new_storage_type !== undefined
    const changed_storage_type = initial_storage_type !== new_storage_type
    const changed_storage_type_from_defined = is_initial_storage_type_defined(initial_storage_type) && changed_storage_type

    const show_warning = changed_storage_type_from_defined && !copy_data
    const show_danger_warning = changed_storage_type_from_defined && copy_data
    const show_single_confirm_button = valid_storage_type && !copy_data
    const show_double_confirm_button = valid_storage_type && copy_data


    const initial_storage_name = get_storage_type_name(initial_storage_type)
    const new_storage_name = get_storage_type_name(new_storage_type)

    return <div style={{ margin: 10 }}>

        <StorageOption
            name={get_storage_type_name("local_storage")}
            description={<div>
                The data is stored in your web browser. It never leaves your web browser. It is not available
                in other web browsers, or on other computers. If you work in an incognito window you data will
                be lost. If you clear your cache &amp; cookies your data will be lost. We recommend using this
                for temporary demos <s>or if you are going to export to a file and reimport it after every
                use</s> [feature not supported yet].
            </div>}
            selected={new_storage_type === "local_storage"}
            on_click={() => set_new_storage_type("local_storage")}
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
            selected={new_storage_type === "solid"}
            on_click={() => set_new_storage_type("solid")}
        />


        <div
            className="section advanced_options_title"
            onClick={() => set_show_advanced(!show_advanced)}
        >
            <span style={{ fontSize: 10 }}>{show_advanced ? "\u25BC" : "\u25B6"}</span>
            &nbsp;{show_advanced ? "Hide" : "Show"} advanced options
        </div>


        {show_advanced && <StorageOption
            name={get_storage_type_name("local_server")}
            description={<div>
                You will need to be running your local Data Curator server at localhost:4000 to use this option successfully. If you choose this option we assume you know what you are doing and have a copy of the code base. If not, please contact {CONTACT_EMAIL_ADDRESS_TAG}
            </div>}
            selected={new_storage_type === "local_server"}
            on_click={() => set_new_storage_type("local_server")}
        />}


        {(show_warning || show_danger_warning) && <div
            className={`section ${show_warning ? "warning" : "danger"}`}
        >
            <WarningTriangle message="" backgroundColor={show_warning ? "" : "red"} />&nbsp;
            Swapping to a new data store ({new_storage_name}) will leave behind your
            current data (in {initial_storage_name}).
            To copy your current data ({initial_storage_name}) to the new storage location ({new_storage_name}) please check this box

            &nbsp;<input type="checkbox" checked={copy_data} onClick={e =>
            {
                e.stopImmediatePropagation()
                set_copy_data(!copy_data)
            }} />&nbsp;

            {show_danger_warning && <div>
                DANGER: you will overwrite the current data
                in '{new_storage_name}' with the data in '{initial_storage_name}'.
            </div>}
        </div>}


        <ButtonGroup size="small" color="primary" variant="contained" fullWidth={true}  disableElevation={true}>
            {show_single_confirm_button && <Button
                value="Confirm"
                disabled={!changed_storage_type}
                onClick={e =>
                {
                    e.stopImmediatePropagation()
                    new_storage_type && change_storage_type({ new_storage_type, copy_from })
                    props.on_close()
                }}
            />}


            {show_double_confirm_button && <ConfirmatoryButton
                button_text="Confirm"
                disabled={!changed_storage_type}
                on_click={() =>
                {
                    new_storage_type && change_storage_type({ new_storage_type, copy_from })
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

    </div>
}



function is_initial_storage_type_defined (initial_storage_type: StorageType | undefined): initial_storage_type is StorageType
{
    return initial_storage_type !== undefined
}
