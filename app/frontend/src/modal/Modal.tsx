import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./Modal.css"
import type { RootState } from "../state/State"



interface OwnProps
{
    title: string | h.JSX.Element
    on_close?: (e?: h.JSX.TargetedMouseEvent<HTMLDivElement>) => void
    child: h.JSX.Element
    size?: "small" | "medium" | "large"
    scrollable?: boolean
}
interface ModalCoreOwnProps extends OwnProps
{
    time_stamp_first_rendered: number
}


function map_state (state: RootState, own_props: ModalCoreOwnProps)
{
    const is_escape = state.global_keys.last_key === "Escape"
    const { last_key_time_stamp = 0 } = state.global_keys
    const should_close = is_escape && last_key_time_stamp > own_props.time_stamp_first_rendered

    return { should_close }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _ModalCore (props: Props)
{
    const { on_close } = props

    if (on_close && props.should_close) setTimeout(() => on_close(), 0)

    return <div
        id="modal_background"
        className={(props.size || "medium") + "_modal"}
        onClick={e =>
        {
            e.stopImmediatePropagation()
            on_close && on_close(e)
        }}
    >
        <div
            id="modal_container"
            style={props.scrollable === false ? { overflowY: "hidden" } : undefined}
            onClick={e => e.stopPropagation()}
        >
            <div id="modal_title">{props.title}</div>
            {on_close && <div id="modal_close" onClick={e => on_close(e)}><span>X</span></div>}

            {props.child}
        </div>
    </div>
}

const ModalCore = connector(_ModalCore) as FunctionalComponent<ModalCoreOwnProps>



export function Modal (props: OwnProps)
{
    // TODO replace this with useRef, or understand why useRef is unsuitable to use.
    const time_stamp_first_rendered = performance.now()

    return <ModalCore
        {...props}
        time_stamp_first_rendered={time_stamp_first_rendered}
    />
}
