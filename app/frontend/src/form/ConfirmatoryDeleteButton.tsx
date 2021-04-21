import { h } from "preact"

import { useState } from "preact/hooks"
import { Button } from "../sharedf/Button"



interface OwnProps
{
    on_delete?: () => void
}


export function ConfirmatoryDeleteButton (props: OwnProps)
{
    const [deleting, set_deleting] = useState(false)

    return <div className="button_container_confirmatory_delete">
        <Button
            is_hidden={!deleting}
            value="CONFIRM"
            extra_class_names="button_warning"
            on_click={() => props.on_delete && props.on_delete()}
        />

        <Button
            is_hidden={!props.on_delete}
            value={deleting ? "CANCEL" : "DELETE"}
            extra_class_names={(deleting ? "" : " button_warning ")}
            on_click={() => set_deleting(!deleting) }
        />
    </div>
}
