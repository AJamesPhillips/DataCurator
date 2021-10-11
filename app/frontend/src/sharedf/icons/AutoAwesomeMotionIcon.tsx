import { h } from "preact"



interface OwnProps
{
    style?: h.JSX.CSSProperties
    className?: string
    size?: "small"
}


// Can not find this icon in our version of Material-ui.  Perhaps just need to upgrade?
export function AutoAwesomeMotionIcon (props: OwnProps)
{
    let { className = "" } = props

    // Manually copied classes and viewBox from material UI icons
    className = "MuiSvgIcon-root " + className
    if (props.size === "small") className += " MuiSvgIcon-fontSizeSmall "

    return <svg className={className} viewBox="0 0 24 24" style={props.style}>
        <path
            d="M14 2H4c-1.11 0-2 .9-2 2v10h2V4h10V2zm4 4H8c-1.11 0-2 .9-2 2v10h2V8h10V6zm2 4h-8c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2z"
        />
    </svg>
}
