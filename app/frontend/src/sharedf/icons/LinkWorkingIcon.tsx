import { CommonIcon, CommonIconOwnProps } from "./common_icon"



const d = "M8 11h8v2H8zm12.1 1H22c0-2.76-2.24-5-5-5h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1zM3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1z M16 18.17 14.33 16.5l-1.42 1.41L16 21 21.0 15.8l-1.41-1.41z"
// Custom icon
export function LinkWorkingIcon (props: CommonIconOwnProps)
{
    return <CommonIcon {...props} d={d} />
}
