import { CommonIcon, CommonIconOwnProps } from "./common_icon"



const d = "M8 18h3v3h2v-3h3l-4-4-4 4zm8-12h-3v-3h-2v3h-3l4 4 4-4zm-12 5v2h16v-2z"
// Custom icon
export function ReducedPossibilitiesIcon (props: CommonIconOwnProps)
{
    return <CommonIcon {...props} d={d} />
}
