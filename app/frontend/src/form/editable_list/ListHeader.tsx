import { h } from "preact"



interface OwnProps {
    items_descriptor: string
    on_click_header?: () => void
    other_content?: () => h.JSX.Element | null
}


export function ListHeader (props: OwnProps)
{
    const {
        items_descriptor,
        on_click_header,
        other_content = () => null,
    } = props


    return <div
        onClick={on_click_header}
        style={{ cursor: on_click_header ? "pointer" : "default" }}
    >
        {other_content()}

        <div className="item_descriptors">{items_descriptor}</div>

        <div style={{ clear: "both" }}></div>
    </div>
}
