import { h } from "preact"



interface ProbabilityGraphProps
{
    calc_x: (x: number) => number
    reverse: boolean
    size?: number
}


export function ProbabilityGraph (props: ProbabilityGraphProps)
{
    const { calc_x, reverse, size = 400 } = props

    const step_x = 0.02
    const max_x = 4
    const x_scale = size / max_x
    const num_lines = (max_x / step_x)

    const process_x = (x: number) => reverse ? (size - x) : x

    const lines = Array.from(Array(num_lines))
        .map((_, i) => i * step_x)
        .map(x => ({
            x1: process_x(x * x_scale),
            y1: size - calc_x(x),
            x2: process_x((x + step_x) * x_scale),
            y2: size - calc_x(x + step_x)
        }))

    return <svg width={size + 1} height={size} style={{ margin: 5 }}>
        <line x1={1} y1={size} x2={1} y2={0} stroke="black" />
        {Array.from(Array(9)).map((_, i) =>
        {
            const x = size * ((i + 1) / 10)
            return <line x1={x} y1={size} x2={x} y2={0} stroke="#bbb" />
        })}
        <line x1={size * 0.50} y1={size} x2={size * 0.50} y2={0} stroke="#555" />
        <line x1={size} y1={size} x2={size} y2={0} stroke="black" />
        <g>
            {lines.map(({ x1, y1, x2, y2}) => <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" />)}
        </g>
    </svg>
}
