import { Component, ComponentClass, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./Modal.css"
import type { RootState } from "../state/State"


interface ModalChildProps
{
    first_render: boolean | undefined
}


interface OwnProps
{
    title: string
    on_close: () => void
    child: (props: ModalChildProps) => h.JSX.Element
}


function map_state (state: RootState)
{
    return {
        last_key: state.global_keys.last_key,
        last_key_time_stamp: state.global_keys.last_key_time_stamp,
    }
}

const connector = connect(map_state)
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps


function calc_should_close (props: Props, time_stamp_first_rendered: number)
{
    const is_escape = props.last_key === "Escape"
    const is_new = props.last_key_time_stamp && props.last_key_time_stamp > time_stamp_first_rendered

    return is_escape && is_new
}


class _Modal extends Component<Props>
{
    private time_stamp_first_rendered = performance.now()
    already_rendered: boolean | undefined = undefined

    render ()
    {
        if (this.already_rendered === undefined) this.already_rendered = false
        else if (this.already_rendered === false) this.already_rendered = true

        const should_close = calc_should_close(this.props, this.time_stamp_first_rendered)
        if (should_close) setTimeout(() => this.props.on_close(), 0)

        return <div id="modal_background" onClick={() => this.props.on_close()}>
            <div id="modal_container" onClick={e => e.stopPropagation()}>
                {this.props.title}
                <div id="modal_close" onClick={() => this.props.on_close()}><span>X</span></div>

                {this.props.child({
                    first_render: !this.already_rendered,
                })}
            </div>
        </div>
    }
}


export const Modal = connector(_Modal) as ComponentClass<OwnProps>
