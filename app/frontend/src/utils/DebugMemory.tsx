import { FunctionComponent } from "preact"
import { useState } from "preact/hooks"
import { connect, ConnectedProps } from "react-redux"

import { ACTIONS } from "../state/actions"



const map_dispatch = {
    noop: () => ({ type: "noop" }),
    toggle_consumption_formatting: () => ACTIONS.display.toggle_consumption_formatting(),
}

const connector = connect(null, map_dispatch)
type Props = ConnectedProps<typeof connector>




function _DebugMemory (props: Props)
{
    const [i, set_i] = useState(0)

    return <div>
        <button onPointerDown={() => call(set_i, i, props.noop, 1) }>noop</button>
        <button onPointerDown={() => call(set_i, i, props.toggle_consumption_formatting, 1) }>toggle</button>
        <button onPointerDown={() => call(set_i, i, props.noop, 99) }>noop 99</button>
        <button onPointerDown={() => call(set_i, i, props.toggle_consumption_formatting, 99)}>toggle 99</button>
        <div>
            Iteration: {i}
            < br/>
            Memory total: {Math.round((performance as any).memory.totalJSHeapSize / 1e6)}
            <br />
            Used: {Math.round((performance as any).memory.usedJSHeapSize / 1e6)}
        </div>

    </div>
}

export const DebugMemory = connector(_DebugMemory) as FunctionComponent




const call = async (set_i: (i: number) => void, i: number, func: () => void, num: number) =>
{
    while (num > 0)
    {
        num--
        set_i(++i)
        func()
        await wait(10)
    }
}


function wait (ms: number)
{
    return new Promise(resolve => setTimeout(resolve, ms))
}
