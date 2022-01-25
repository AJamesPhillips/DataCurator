import { h } from "preact"
import { useEffect, useState } from "preact/hooks"

import "./ColorPicker.css"
import { EditableNumber } from "../form/EditableNumber"
import { Color, color_is_whole } from "../shared/interfaces/color"
import { bounded } from "../shared/utils/bounded"
import { color_to_string } from "./color"



type OwnProps = DefiniteColorPickerProps | MaybeColorPickerProps


const white: Color = { r: 255, g: 255, b: 255, a: 1 }


export function ColorPicker (props: OwnProps)
{
    return props.allow_undefined
        ? <MaybeColorPicker
            color={props.color}
            allow_undefined={true}
            conditional_on_blur={props.conditional_on_blur}
        />
        : <DefiniteColorPicker
            color={props.color}
            conditional_on_blur={props.conditional_on_blur}
        />
}



interface DefiniteColorPickerProps
{
    color?: Color
    allow_undefined?: false
    conditional_on_blur: (color: Color) => void
}
function DefiniteColorPicker (props: DefiniteColorPickerProps)
{
    const initial_color = props.color || white
    const [color, _set_color] = useState<Color>(initial_color)
    useEffect(() => _set_color(initial_color), [props.color])

    const set_color = (partial_color: Partial<Color>) =>
    {
        const valid_new_color = get_valid_new_color(color, partial_color)
        _set_color(valid_new_color)
    }


    const on_blur = (partial_color: Partial<Color>) =>
    {
        const valid_new_color = get_valid_new_color(color, partial_color)
        _set_color(valid_new_color)
        if (colours_different(props.color, valid_new_color)) props.conditional_on_blur(valid_new_color)
    }


    return <ColorPickerInner
        color={color}
        allow_undefined={false}
        set_color={set_color}
        on_blur={on_blur}
    />
}



interface MaybeColorPickerProps
{
    color?: Partial<Color>
    allow_undefined: true
    conditional_on_blur: (color: Partial<Color> | undefined) => void
}
function MaybeColorPicker (props: MaybeColorPickerProps)
{
    const [color, _set_color] = useState<Partial<Color> | undefined>(props.color)
    useEffect(() => _set_color(props.color), [props.color])

    const set_color = (partial_color: Partial<Color>) =>
    {
        const valid_new_color = get_valid_new_color(color, partial_color)
        _set_color(valid_new_color)
    }


    const on_blur = (partial_color: Partial<Color>) =>
    {
        const valid_new_color = get_valid_new_color(color, partial_color)
        _set_color(valid_new_color)
        if (colours_different(props.color, valid_new_color)) props.conditional_on_blur(valid_new_color)
    }


    return <ColorPickerInner
        color={color}
        allow_undefined={true}
        set_color={set_color}
        on_blur={on_blur}
    />
}



type ColorPickerInnerProps =
{
    color: Color
    allow_undefined: false
    set_color: (color: Partial<Color>) => void
    on_blur: (color: Partial<Color>) => void
} |
{
    color: Partial<Color> | undefined
    allow_undefined: true
    set_color: (color: Partial<Color>) => void
    on_blur: (color: Partial<Color>) => void
}
function ColorPickerInner (props: ColorPickerInnerProps)
{
    const { color, set_color, on_blur } = props

    return <div className="color_picker">
        {/* <span className="description_label">r</span> */}
        <EditableNumber
            placeholder="r"
            value={color?.r}
            allow_undefined={true}
            conditional_on_change={r => set_color({ r })}
            always_on_blur={r => on_blur({ r })}
            style={{ width: 65 }}
        /> &nbsp;

        {/* <span className="description_label">g</span> */}
        <EditableNumber
            placeholder="g"
            value={color?.g}
            allow_undefined={true}
            conditional_on_change={g => set_color({ g })}
            always_on_blur={g => on_blur({ g })}
            style={{ width: 65 }}
        /> &nbsp;

        {/* <span className="description_label">b</span> */}
        <EditableNumber
            placeholder="b"
            value={color?.b}
            allow_undefined={true}
            conditional_on_change={b => set_color({ b })}
            always_on_blur={b => on_blur({ b })}
            style={{ width: 65 }}
        /> &nbsp;

        <EditableNumber
            placeholder="a"
            value={color?.a}
            allow_undefined={true}
            conditional_on_change={a => set_color({ a })}
            always_on_blur={a => on_blur({ a })}
            style={{ width: 65 }}
        /> &nbsp;


        <div
            className="color_swatch"
            style={{ backgroundColor: color_is_whole(color) ? color_to_string(color) : undefined }}
        />
    </div>
}



function get_valid_new_color (color: Color, partial_color: Partial<Color>): Color
function get_valid_new_color (color: Partial<Color>, partial_color: Partial<Color>): Partial<Color>
function get_valid_new_color (color: undefined, partial_color: Partial<Color>): undefined
function get_valid_new_color (color: Partial<Color> | undefined, partial_color: Partial<Color>): Partial<Color> | undefined
function get_valid_new_color (color: Partial<Color> | undefined, partial_color: Partial<Color>): Partial<Color> | undefined
{
    const new_color: Partial<Color> | undefined = { ...color, ...partial_color }
    const valid_new_color = bound_color(new_color)
    return valid_new_color
}


function bound_color (color: Color): Color
function bound_color (color: Partial<Color>): Partial<Color>
function bound_color (color: undefined): undefined
function bound_color (color: Partial<Color> | undefined): Partial<Color> | undefined
{
    if (!color) return undefined

    let { r, g, b, a } = color

    r = r === undefined ? r : bounded(r, 0, 255)
    g = g === undefined ? g : bounded(g, 0, 255)
    b = b === undefined ? b : bounded(b, 0, 255)
    a = a === undefined ? a : bounded(a, 0, 1)

    return color
}



function colours_different (color1: Partial<Color> | undefined, color2: Partial<Color> | undefined)
{
    if (!color1) return color2 ? true : false
    else if (!color2) return true

    return color1.r !== color2.r || color1.g !== color2.g || color1.b !== color2.b || color1.a !== color2.a
}
