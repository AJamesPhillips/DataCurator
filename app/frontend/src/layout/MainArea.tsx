import { h } from "preact"
import { MainContentControls } from "./MainContentControls"



interface OwnProps {
    main_content: h.JSX.Element
}


export function MainArea (props: OwnProps)
{
    return <div id="main_area">
        <div className="main_content">
            {props.main_content}
        </div>
        <MainContentControls />
    </div>
}
