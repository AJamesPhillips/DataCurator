import { h } from "preact"



export interface CommonIconOwnProps
{
    style?: h.JSX.CSSProperties
    className?: string
    size?: "small"
    title?: string
}


interface Props extends CommonIconOwnProps
{
    d: string
}


export function CommonIcon (props: Props)
{
    let { className = "" } = props

    // Manually copied classes and viewBox from material UI icons
    className = "MuiSvgIcon-root " + className
    if (props.size === "small") className += " MuiSvgIcon-fontSizeSmall "

    return <span title={props.title}>
        <svg className={className} viewBox="0 0 24 24" style={props.style}>
            <path d={props.d} />
        </svg>
    </span>
}
