import { h } from "preact"
import type { CanvasPoint } from "../canvas/interfaces"
import { round_coordinate_small_step } from "../canvas/position_utils"
import { h_step, v_step } from "../state/display/display"

import { EditableNumber } from "./EditableNumber"



interface OwnProps
{
    point: CanvasPoint
    on_update: (arg: CanvasPoint) => void
}

export function EditablePosition (props: OwnProps)
{
    const { point, on_update } = props
    const { left, top } = point

    function update (arg: Partial<CanvasPoint>)
    {
        on_update({ ...point, ...arg })
    }

    return <div>
        Left: <EditableNumber
            placeholder="Left"
            value={left}
            allow_undefined={false}
            on_change={new_left => update({ left: round_coordinate_small_step(new_left) }) }
        />
        <input
            type="button"
            value="&#8592;"
            onClick={() => update({ left: round_coordinate_small_step(left - h_step) })}
        />
        <input
            type="button"
            value="&#8594;"
            onClick={() => update({ left: round_coordinate_small_step(left + h_step) })}
        />

        Top: <EditableNumber
            placeholder="Top"
            value={top}
            allow_undefined={false}
            on_change={new_top => update({ top: round_coordinate_small_step(new_top) }) }
        />
        <input
            type="button"
            value="&#8593;"
            onClick={() => update({ top: round_coordinate_small_step(top - v_step) })}
        />
        <input
            type="button"
            value="&#8595;"
            onClick={() => update({ top: round_coordinate_small_step(top + v_step) })}
        />
    </div>
}
