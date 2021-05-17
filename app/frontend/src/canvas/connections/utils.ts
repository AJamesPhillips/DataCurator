

interface Vector
{
    x: number
    y: number
}


export function to_vec (angle: number, r: number): Vector
{
    const x = r * Math.cos(angle)
    const y = r * Math.sin(angle)
    return { x, y }
}



export function add_vec (vec1: Vector, vec2: Vector): Vector
{
    return { x: vec1.x + vec2.x, y: vec1.y + vec2.y }
}



export function multiply_vec (vec1: Vector, vec2: Vector): Vector
{
    return { x: vec1.x * vec2.x, y: vec1.y * vec2.y }
}
