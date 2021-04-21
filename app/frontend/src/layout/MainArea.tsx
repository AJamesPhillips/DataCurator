import { h } from "preact"


interface OwnProps {
    main_content: h.JSX.Element
    main_content_controls: (h.JSX.Element | null)[]
}


export function MainArea (props: OwnProps)
{
    return <div id="main_area">
        <div className="main_content">
            {props.main_content}
        </div>
        <div className="main_content_controls">
            {props.main_content_controls}
        </div>
    </div>
}
