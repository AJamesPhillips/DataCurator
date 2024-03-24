import { ComponentChildren } from "preact"



export function AnchorTag (props: { href: string, title: string, children: ComponentChildren })
{
    return <a
        href={props.href}
        onClick={e => e.stopImmediatePropagation()}
        onPointerDown={e => e.stopImmediatePropagation()}
    >
        {props.children}
    </a>
}
