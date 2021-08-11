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

    const no_storage_type = storage_type === undefined


    return <Modal
        title={<div style={{ margin: 10 }}>
            <h2 style={{ display: "inline" }}>Where would you like to store your data?</h2>
            <span>&nbsp; (You can change this at any time)</span>
        </div>}
        size="medium"
        on_close={e => props.on_close(e)}

        child={() => <div style={{ margin: 10 }}>

            <StorageOption
                name="Local storage"
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
                name="Solid"
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
                name="Local server"
                description={<div>
                    You will need to be running your local data curator server at localhost:4000 to use this option successfully. If you choose this option we assume you know what you are doing and have a copy of the code base. If not, please contact {CONTACT_EMAIL_ADDRESS_TAG}
                </div>}
                selected={storage_type === "local_server"}
                on_click={() => set_storage_type("local_server")}
            />}


            <ButtonGroup size="small" color="primary" variant="contained" fullWidth={true}  disableElevation={true}>
                <Button
                    value={no_storage_type ? "Please select storage type first" : "Confirm"}
                    disabled={no_storage_type}
                    onClick={e =>
                    {
                        e.stopImmediatePropagation()
                        storage_type && props.update_storage_type({ storage_type })
                        props.on_close()
                    }}
                />
            </ButtonGroup>

        </div>}
    />
}

export const SelectStorageType = connector(_SelectStorageType) as FunctionalComponent<OwnProps>
