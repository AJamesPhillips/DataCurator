import { useState } from "preact/hooks"

import { grid_small_step, h_step, round_coordinate_small_step, v_step } from "../canvas/position_utils"
import { EditableNumber } from "./EditableNumber"
import { EditableTextOnBlurType } from "./editable_text/editable_text_common"



interface OwnProps
{
    on_update: (arg: { change_left: number, change_top: number }) => void
}

export function EditablePosition (props: OwnProps)
{
    const [change_left, set_change_left] = useState(0)
    const [change_top, set_change_top] = useState(0)


    const on_update = (arg: Partial<{ change_left: number, change_top: number }>) =>
    {
        props.on_update({
            change_left: arg.change_left ? round_coordinate_small_step(arg.change_left) : 0,
            change_top: arg.change_top ? round_coordinate_small_step(arg.change_top) : 0,
        })
    }


    return <div>
        <p style={{ fontSize: 10, color: "#888" }}>
            Increments of {grid_small_step} pixels
        </p>


        Move right: <EditableNumber
            placeholder="Right"
            value={change_left}
            allow_undefined={false}
            on_blur={new_change_left => set_change_left(round_coordinate_small_step(new_change_left))}
            on_blur_type={EditableTextOnBlurType.conditional}
        />
        <input
            type="button"
            value="Move"
            disabled={change_left === 0}
            onClick={() => on_update({ change_left })}
        /> &nbsp;
        <input
            type="button"
            value="&#8592;"
            onClick={() => on_update({ change_left: -grid_small_step })}
        />
        <input
            type="button"
            value="&#8592;&#8592;"
            onClick={() => on_update({ change_left: -h_step })}
        />
        <input
            type="button"
            value="&#8594;&#8594;"
            onClick={() => on_update({ change_left: h_step })}
        />
        <input
            type="button"
            value="&#8594;"
            onClick={() => on_update({ change_left: grid_small_step })}
        />
        <br /><br />


        Move up: <EditableNumber
            placeholder="Up"
            value={-change_top}
            allow_undefined={false}
            on_blur={new_change_top => set_change_top(round_coordinate_small_step(-new_change_top))}
            on_blur_type={EditableTextOnBlurType.conditional}
        />
        <input
            type="button"
            value="Move"
            disabled={change_top === 0}
            onClick={() => on_update({ change_top })}
        /> &nbsp;
        <input
            type="button"
            value="&#8593;"
            onClick={() => on_update({ change_top: -grid_small_step })}
        />
        <input
            type="button"
            value="&#8593;&#8593;"
            onClick={() => on_update({ change_top: -v_step })}
        />
        <input
            type="button"
            value="&#8595;&#8595;"
            onClick={() => on_update({ change_top: v_step })}
        />
        <input
            type="button"
            value="&#8595;"
            onClick={() => on_update({ change_top: grid_small_step })}
        />
    </div>
}
