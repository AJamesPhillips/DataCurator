import { h } from "preact"



export interface CommonIconOwnProps
{
    style?: h.JSX.CSSProperties
    className?: string
    fontSize?: "small" // name of "fontSize" instead of "size" is copying material-ui interface
    title?: string
}


interface Props extends CommonIconOwnProps
{
    d: string
    svg_elements?: h.JSX.Element[]
}


export function CommonIcon (props: Props)
{
    let { className = "" } = props

    // Manually copied classes and viewBox from material UI icons
    className = "MuiSvgIcon-root " + className
    if (props.fontSize === "small") className += " MuiSvgIcon-fontSizeSmall "

    // TODO, title only shows on bottom half of the icon as span only seems to be half the
    // height of the icon it contains
    return <span title={props.title}>
        <svg className={className} viewBox="0 0 24 24" style={props.style}>
            <path d={props.d} />
            {props.svg_elements}
        </svg>
    </span>
}
