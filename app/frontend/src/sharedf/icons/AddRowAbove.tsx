import { CommonIconOwnProps, CommonIcon } from "./common_icon"



const d = "M19 5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2z m0 14h-14v-5h14z m0 -12v5h-14v-5h1v-2h12v2z m-3 -2h-3v-3h-2v3h-3v2h3v3h2v-3h3z"
// Custom icon
export function AddRowAbove (props: CommonIconOwnProps)
{
    return <CommonIcon {...props} d={d} />
}
