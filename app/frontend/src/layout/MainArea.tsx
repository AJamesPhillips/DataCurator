import "./MainArea.scss"
import { h } from "preact"
import { MainContentControls } from "./MainContentControls"

interface OwnProps {
    main_content: h.JSX.Element
}
export function MainArea (props: OwnProps)
{
  return (
    <div id="main_area">
      <div id="main_content">
        {props.main_content}
      </div>
      <div id="main_content_controls">
        <MainContentControls />
      </div>
    </div>
  )
}
