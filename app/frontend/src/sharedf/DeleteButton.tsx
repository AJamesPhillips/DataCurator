
import "./DeleteButton.css"



interface OwnProps
{
    on_delete: () => void
    is_large?: boolean
    disabled?: boolean
}


export function DeleteButton (props: OwnProps)
{
    let value = "X"
    if (props.is_large) value = "Delete"

    const class__large = props.is_large ? " large " : ""
    const class__disabled = props.disabled ? " disabled " : ""
    const class_names = `delete_button ${class__large} ${class__disabled}`

    return <input
        type="button"
        value={value}
        onClick={() => props.on_delete()}
        className={class_names}
        disabled={props.disabled}
    ></input>
}
