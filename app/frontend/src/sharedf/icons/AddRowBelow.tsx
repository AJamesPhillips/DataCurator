import { CommonIcon, CommonIconOwnProps } from "./common_icon"



const d = "M19 2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2z m0 7h-14v-5h14z m0 7h-1v2h-12v-2h-1v-5h14z m-3 0h-3v-3h-2v3h-3v2h3v3h2v-3h3z"
// Custom icon
export function AddRowBelow (props: CommonIconOwnProps)
{
    return <CommonIcon {...props} d={d} />
}
