


export interface Color
{
    r: number
    g: number
    b: number
    a: number
}



export function color_is_whole (color: Partial<Color> | undefined): color is Color
{
    if (!color) return false

    return color.r !== undefined
        && color.g !== undefined
        && color.b !== undefined
        && color.a !== undefined
}



export function color_is_empty (color: Partial<Color> | undefined)
{
    if (!color) return true

    return color.r === undefined
        && color.g === undefined
        && color.b === undefined
        && color.a === undefined
}
