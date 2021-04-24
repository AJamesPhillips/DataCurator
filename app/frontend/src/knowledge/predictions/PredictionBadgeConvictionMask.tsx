import { h } from "preact"

import "./PredictionBadgeConvictionMask.css"



interface Props
{
    size: number
    border_width: number
    elements_width: 10
    conviction: number
}


export function PredictionsBadgeConvictionMask (props: Props)
{
    const { size, border_width, elements_width, conviction } = props

    const cell_size = size / elements_width

    // ;(window as any).new_mask = generate_predictions_badge_conviction_mask(props)
    // console. log(JSON.stringify(window.mask_data).replace(/\],\[/g, "],\n    ["))

    return <g
        className={`conviction_mask`}
        onMouseEnter={e => e.currentTarget.classList.add("hovered")}
        onMouseLeave={e => e.currentTarget.classList.remove("hovered")}
        ref={r => {
            if (!r) return

            const parts = r.getElementsByClassName("parts")[0]

            for (let i = 0; i < parts.children.length; ++i) {
                const el = parts.children[i]
                const group_id_string = el.getAttribute("data-group_id")
                if (!group_id_string) continue

                const group_id = parseInt(group_id_string, 10) / 100
                let style = group_id <= conviction ? `display: none;` : ""
                const grey = 130 + Math.random() * 45
                style += `fill: rgb(${grey},${grey},${grey})`
                el.setAttribute("style", style)
            }
        }}
    >
        {/* Make the g element have max size: */}
        <rect x={0} y={0} width={size+2} height={size+2} fill="rgba(0,0,0,0)" />

        <g className="parts">
            {/* {(window as any).mask_data.map(e => <rect */}
            {mask_data.map(e => <rect
                data-group_id={e[2]}
                x={border_width + (e[0] * cell_size)}
                y={border_width + (e[1] * cell_size)}
                width={cell_size}
                height={cell_size}
            />)}
        </g>
    </g>
}



function generate_predictions_badge_conviction_mask (props: Props)
{
    const { elements_width } = props
    const total_elements = elements_width * elements_width

    // When the conviction is less than the group_id (key of groups object),
    // the randomly corresponding conviction mask will be displayed
    const groups = {
        "100": 2,
        "98": 3,
        "95": 5,
        "90": 10,
        "80": 10,
        "70": 10,
        "60": 10,
        "50": 10,
        "40": 10,
        "30": 10,
        "20": 10,
        "10": 5,
        "5": 3,
        "2": 2,
    }

    function get_group ()
    {
        const choices = (Object.keys(groups) as (keyof typeof groups)[]).filter(k => groups[k] > 0)
        const index = Math.floor(Math.random() * choices.length)
        const group_id = choices[index]
        groups[group_id] -= 1
        return group_id
    }

    function get_groupv2 ()
    {
        const choices: (keyof typeof groups)[] = []

        ;(Object.keys(groups) as (keyof typeof groups)[])
            .forEach(k => Array.from(Array(groups[k])).forEach(_ => choices.push(k)))

        const index = Math.floor(Math.random() * choices.length)
        const group_id = choices[index]
        groups[group_id] -= 1
        return group_id
    }

    return Array.from(Array(total_elements))
        .map((_, i) => {
            const i_frac = i / total_elements
            const x = i % elements_width
            const y = Math.floor(i / elements_width)

            return {
                i, i_frac, x, y,
                ys: elements_width - 1 - x,
                xs: y,
            }
        })
        .map(e => {
            const group_id = get_groupv2()
            return [e.xs, e.ys, parseInt(group_id)]
        })
}


// mask_data is of the form: [e.xs, e.ys, group_id]
const mask_data = [
    [0,9,40],
    [0,8,30],
    [0,7,40],
    [0,6,90],
    [0,5,10],
    [0,4,95],
    [0,3,60],
    [0,2,60],
    [0,1,90],
    [0,0,40],
    [1,9,20],
    [1,8,50],
    [1,7,80],
    [1,6,60],
    [1,5,80],
    [1,4,90],
    [1,3,90],
    [1,2,30],
    [1,1,50],
    [1,0,30],
    [2,9,20],
    [2,8,50],
    [2,7,80],
    [2,6,40],
    [2,5,70],
    [2,4,20],
    [2,3,20],
    [2,2,50],
    [2,1,60],
    [2,0,40],
    [3,9,90],
    [3,8,50],
    [3,7,20],
    [3,6,30],
    [3,5,60],
    [3,4,50],
    [3,3,20],
    [3,2,2],
    [3,1,95],
    [3,0,10],
    [4,9,80],
    [4,8,30],
    [4,7,90],
    [4,6,60],
    [4,5,50],
    [4,4,100],
    [4,3,40],
    [4,2,70],
    [4,1,30],
    [4,0,98],
    [5,9,20],
    [5,8,40],
    [5,7,70],
    [5,6,50],
    [5,5,70],
    [5,4,90],
    [5,3,50],
    [5,2,70],
    [5,1,10],
    [5,0,80],
    [6,9,20],
    [6,8,5],
    [6,7,30],
    [6,6,50],
    [6,5,70],
    [6,4,100],
    [6,3,20],
    [6,2,90],
    [6,1,60],
    [6,0,60],
    [7,9,30],
    [7,8,70],
    [7,7,80],
    [7,6,70],
    [7,5,20],
    [7,4,10],
    [7,3,30],
    [7,2,98],
    [7,1,98],
    [7,0,90],
    [8,9,5],
    [8,8,60],
    [8,7,95],
    [8,6,70],
    [8,5,70],
    [8,4,80],
    [8,3,95],
    [8,2,40],
    [8,1,95],
    [8,0,2],
    [9,9,40],
    [9,8,40],
    [9,7,80],
    [9,6,80],
    [9,5,90],
    [9,4,10],
    [9,3,5],
    [9,2,60],
    [9,1,80],
    [9,0,30]
]

// ;(window as any).mask_data = mask_data
