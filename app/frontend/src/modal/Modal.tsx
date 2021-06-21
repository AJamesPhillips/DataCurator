import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./Modal.css"
import type { RootState } from "../state/State"



interface OwnProps
{
    title: string
    on_close: () => void
    child: () => h.JSX.Element
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
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & ModalCoreOwnProps



function _ModalCore (props: Props)
{
    if (props.should_close) setTimeout(() => props.on_close(), 0)

    return <div id="modal_background" onClick={() => props.on_close()}>
        <div id="modal_container" onClick={e => e.stopPropagation()}>
            {props.title}
            <div id="modal_close" onClick={() => props.on_close()}><span>X</span></div>

            {props.child()}
        </div>
    </div>
}

const ModalCore = connector(_ModalCore) as FunctionalComponent<ModalCoreOwnProps>



export function Modal (props: OwnProps)
{
    const time_stamp_first_rendered = performance.now()

    return <ModalCore
        {...props}
        time_stamp_first_rendered={time_stamp_first_rendered}
    />
}
