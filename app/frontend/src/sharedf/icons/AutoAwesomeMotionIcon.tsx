import { h } from "preact"
import { CommonIconOwnProps, CommonIcon } from "./common_icon"



const d = "M14 2H4c-1.11 0-2 .9-2 2v10h2V4h10V2zm4 4H8c-1.11 0-2 .9-2 2v10h2V8h10V6zm2 4h-8c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2z"
// Can not find this icon in our version of Material-ui.  Perhaps just need to upgrade?
export function AutoAwesomeMotionIcon (props: CommonIconOwnProps)
{
    return <CommonIcon {...props} d={d} />
}
