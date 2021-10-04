import { h } from "preact"



interface OwnProps
{
    style?: h.JSX.CSSProperties
}


// Can not find this icon in our version of Material-ui.  Perhaps just need to upgrade?
export function AddLinkIcon (props: OwnProps)
{
    // Manually copied classes and viewBox from material UI icons
    return <svg class="MuiSvgIcon-root" viewBox="0 0 24 24" style={props.style}>
        <path
            d="M8 11h8v2H8zm12.1 1H22c0-2.76-2.24-5-5-5h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1zM3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM19 12h-2v3h-3v2h3v3h2v-3h3v-2h-3z"
        />
    </svg>
}
