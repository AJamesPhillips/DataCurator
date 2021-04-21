import { h } from "preact"
import { useState } from "preact/hooks"
import { ProbablitySelection } from "../probability/ProbabililtySelection"
import { get_probability_option } from "../probability/probabilities"
import { ProbabilityGraph } from "../probability/ProbabilityGraph"
import { factory_scaled_weibull } from "../probability/weibulll"

import "./PredictionsGraph.css"


const max_conviction = 100


interface PredictionsGraphCellArgs
{
    filled: boolean
    title: string
    clicked?: (left_button: boolean) => void

    cell_height: number
    border_width: number
}

function PredictionsGraphCell (props: PredictionsGraphCellArgs)
{
    return <div
        className="prediction_cell"
        style={{ height: props.cell_height, borderWidth: props.border_width }}
        onClick={e => props.clicked && props.clicked(true)}
        onContextMenu={e => {
            e.preventDefault()
            props.clicked && props.clicked(false)
        }}
        title={props.title}
    >
        <div style={{ backgroundColor: props.filled ? "#777" : "#DDD", height: "100%", }}></div>
    </div>
}


interface PredictionsGraphColumnArgs
{
    start: number
    progress: number
    conviction: number
    changed_conviction?: (new_conviction: number) => void

    y_divs: number
    border_width: number
    graph_size: number
}

function is_filled (args: { y: number, conviction: number, conviction_increment: number })
{
    return (max_conviction - (args.y * args.conviction_increment)) <= args.conviction
}

const column_width = (args: { progress: number, border_width: number, graph_size: number }) =>
{
    const extra_width = Math.max(0, 2 - args.border_width)
    return (args.progress * args.graph_size) + (args.border_width * 2) + extra_width
}


function PredictionsGraphColumn (props: PredictionsGraphColumnArgs)
{
    const conviction_increment = max_conviction / props.y_divs

    const handle_clicked_cell = props.changed_conviction ? (left_button: boolean) =>
    {
        if (left_button)
        {
            if (props.conviction < max_conviction) props.changed_conviction!(props.conviction + conviction_increment)
        }
        else
        {
            if (props.conviction > 0) props.changed_conviction!(props.conviction - conviction_increment)
        }
    } : undefined

    const handle_bulk_toggle = props.changed_conviction ? () =>
    {
        if (props.conviction < max_conviction) props.changed_conviction!(max_conviction)
        else if (props.conviction > 0) props.changed_conviction!(0)
    } : undefined

    const width = column_width(props)
    const cell_height = props.graph_size / props.y_divs

    return <div className="prediction_column_container">
        <div className="prediction_column" style={{ width }}>

            {Array.from(Array(props.y_divs)).map((_, y) => {

                let title = `${props.conviction.toFixed(2)}%`

                if (props.progress !== 0.5)
                {
                    title += ` ${Math.round(props.start * 100)}-${Math.round((props.start + props.progress) * 100)}%`
                }

                return <PredictionsGraphCell
                    filled={is_filled({ y, conviction: props.conviction, conviction_increment })}
                    title={title}
                    clicked={handle_clicked_cell}
                    cell_height={cell_height}
                    border_width={props.border_width}
                />
            })}

        </div>

        {props.changed_conviction && <PredictionsGraphColumnBulkEdit width={width} toggle_column={handle_bulk_toggle} />}
    </div>
}


function PredictionsGraphColumnBulkEdit (props: { width: number, toggle_column?: () => void })
{
    return <input
        type="button"
        value=""
        title="Toggle column"
        onClick={() => props.toggle_column && props.toggle_column()}
        style={{ width: props.width - 2, margin: 1 }}
    ></input>
}


function PredictionsGraphRowBulkEdit (props: { change_row: (increase: boolean) => void })
{
    return <div
        style={{
            verticalAlign: "top",
            display: "inline-block",
            width: 80,
            marginLeft: 10,
        }}
    >
        <input type="button" value="+" onClick={() => props.change_row(true)}></input>
        <input type="button" value="-" onClick={() => props.change_row(false)}></input>
    </div>
}



type PredictionsGraphData = { progress: number, conviction: number }[]
interface PredictionsGraphOptions
{
    y_divs: number
}

interface PredictionsGraphArgs extends Partial<PredictionsGraphOptions>
{
    data: PredictionsGraphData
    outcome_a: string
    outcome_b: string
    invalid?: boolean
}


export function PredictionsGraph (props: PredictionsGraphArgs)
{
    const [data, _set_data] = useState(props.data)

    const x_divs = Math.max(1, data.length)
    const x_increment = 1 / x_divs

    const y_divs = Math.max(1, props.y_divs || 10)
    const conviction_increment = max_conviction / y_divs


    function set_data_safely (data: PredictionsGraphData)
    {
        data.forEach(d =>
        {
            d.conviction = Math.max(0, Math.min(d.conviction, max_conviction))
        })
        _set_data(data)
    }


    function factor_changed_column (column: number)
    {
        return (new_conviction: number) =>
        {
            const new_data = [...data]
            new_data[column] = { progress: new_data[column].progress, conviction: new_conviction }

            set_data_safely(new_data)
        }
    }


    function change_row (increase: boolean)
    {
        const new_data = data.map(d => {
            if (increase && d.conviction < max_conviction)
            {
                return { ...d, conviction: d.conviction + conviction_increment }
            }
            else if (!increase && d.conviction > 0)
            {
                return { ...d, conviction: d.conviction - conviction_increment }
            }

            return d
        })
        set_data_safely(new_data)
    }

    const invalid = props.invalid // || is_invalid_data(data)

    return <div className={"prediction_graph " + (invalid ? "invalid" : "")}>
        <div style={{ float: "left", position: "relative" }}>
            <div>{props.outcome_a}</div>
            <div style={{ position: "absolute", top: 0, right: 0 }}>{props.outcome_b}</div>

            {data.map((args, i) => <PredictionsGraphColumn
                {...args}
                start={i * x_increment}
                changed_conviction={factor_changed_column(i)}
                y_divs={y_divs}
                border_width={2}
                graph_size={400}
            />)}
        </div>
        <PredictionsGraphRowBulkEdit change_row={change_row} />

        <div>
            Sum: {get_sum(data)}
        </div>

        <div>
            {JSON.stringify(data)}
        </div>
    </div>
}


export function PredictionsGraphMini (props: PredictionsGraphArgs)
{
    const x_divs = Math.max(1, props.data.length)
    const x_increment = 1 / x_divs

    const y_divs = Math.max(1, props.y_divs || 10)
    const invalid = props.invalid //|| is_invalid_data(props.data)

    return <div className={"prediction_graph mini " + (invalid ? "invalid" : "")}>
        <div style={{ float: "left", position: "relative" }}>
            <div className="label" title={props.outcome_a}>A</div>
            <div className="label label_b" title={props.outcome_b}>B</div>

            {props.data.map((args, i) => <PredictionsGraphColumn
                {...args}
                start={i * x_increment}
                y_divs={y_divs}
                border_width={0.5}
                graph_size={40}
            />)}
        </div>
    </div>
}


function get_sum (data: PredictionsGraphData)
{
    let sum = 0
    data.forEach(({ progress, conviction }) => {
        sum += conviction
    })

    return sum
}


function is_invalid_data (data: PredictionsGraphData)
{
    const sum = get_sum(data)
    // let start = 0
    // data.forEach(({ progress, conviction }) => {
    //     start += progress
    // })

    return sum.toFixed(2) !== "100.00" // && start === 1
}



function WeibullGraphMaker ()
{
    const [probability, _set_probability] = useState(1)
    const [lambda, set_lambda] = useState(1)
    const [k, set_k] = useState(1)
    const [reverse, set_reverse] = useState(false)


    function set_probability (p: number)
    {
        _set_probability(p)

        const probability_option = get_probability_option(p)
        if (probability_option)
        {
            set_lambda(probability_option.lambda)
            set_k(probability_option.k)
            set_reverse(probability_option.reverse)
        }
    }


    const scale = 100
    const calc_x = factory_scaled_weibull({ lambda, k, scale })

    return <div>
        Probability: {probability}%

        <ProbabilityGraph calc_x={calc_x} size={scale * 4} reverse={reverse} />

        <br />

        <ProbablitySelection probability={probability} set_probability={set_probability} />
        <br />
        {/* <ConvictionSelection /> */}

        <br />

        Lambda: {lambda}
        <input
            type="range"
            value={lambda}
            max={10}
            step={0.1}
            onChange={e => set_lambda(parseFloat(e.currentTarget.value.slice(0, 4)))}
        />

        k: {k}
        <input
            type="range"
            value={k}
            max={10}
            step={0.1}
            onChange={e => set_k(parseFloat(e.currentTarget.value.slice(0, 4)))}
        />

        <br /><hr /><br />

    </div>
}



export function DemoPredictionsGraph ()
{
    return <WeibullGraphMaker />

    /*
    const x_divs = 21
    const y_divs = 20
    return <div>
        <PredictionsGraph
            data={Array.from(Array(x_divs)).map((_, x) => ({ progress: 1 / x_divs, conviction: 0.0 }))}
            outcome_a="A"
            outcome_b="B"
            y_divs={y_divs}
            // changed={() => {}}
        />

        <div style={{ clear: "both" }}></div> <hr />

        Predictions we might make on 1 coin flip:

        <div className="multiple_mini_prediction_graphs">

        Will not get heads or tails, vs will get heads or tails:
        <PredictionsGraphMini
            data={[{"progress":0.5,"conviction":0},{"progress":0.5,"conviction":100}]}
            outcome_a="Do not get heads or tails"
            outcome_b="Get Heads or Tails"
            y_divs={10}
        />


        <br /><br />
        Will get a head, vs will get a tail:
        <PredictionsGraphMini
            data={[{"progress":0.5,"conviction":50},{"progress":0.5,"conviction":50}]}
            outcome_a="Heads"
            outcome_b="Tails"
            y_divs={10}
        />


        <br /><br />
        The second graph encapsulates the knowledge in the first, i.e.<br />
        How sure are you that it will be a head or a tail? A) 100% <br />
        And adds that: How sure are you that it will be a head instead of a tail? A) 50%


        <br /><br />
        Not 50% chance, vs 50% chance of getting a head, and 50% of getting a tail:
        <PredictionsGraphMini
            data={[{"progress":0.5,"conviction":0},{"progress":0.5,"conviction":100}]}
            outcome_a="Not 50%"
            outcome_b="50%:50%"
            y_divs={10}
        />


        <br /><br />
        The third graph encapsulates the same knowledge as the second, i.e.<br />
        Not only that you are 100% sure it will be a head or a tail.<br />
        And that you are 50% sure it will be a head instead of a tail. <br />


        <br /><br />
        Conviction by probability of getting a head:
        <PredictionsGraphMini
            data={[{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":100},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0}]}
            outcome_a="0% chance to get a head"
            outcome_b="100% chance to get a head"
            y_divs={10}
        />


        <br /><br />
        The fourth graph is the same knowledge as the second and third, i.e.<br />
        You are 100% sure it will be a head or a tail.<br />
        And that you are 50% sure it will be a head instead of a tail. <br />
        (Note: this graph isn't quite right because the 50% category should be infinitely narrow instead of 45-55%). <br />






        <div style={{ clear: "both" }}></div> <hr />

        Predictions we might make on 1 <b>weighted</b> coin flip: <br/>
        Do not gets heads or tails vs get heads or tails:
        <PredictionsGraphMini
            data={[{"progress":0.5,"conviction":0},{"progress":0.5,"conviction":100}]}
            outcome_a="Do not get heads or tails"
            outcome_b="Get heads or tails"
            y_divs={10}
        />


        <br/><br/>
        Will get a head, vs will get a tail:

        <PredictionsGraphMini
            data={[{"progress":0.5,"conviction":50},{"progress":0.5,"conviction":50}]}
            outcome_a="Heads"
            outcome_b="Tails"
            y_divs={10}
        />


        <br /><br />
        Identical second graph to the second graph for the fair coin.


        <br/><br/>
        Not 50% chance, vs 50% chance of getting a head, and 50% of getting a tail:

        <PredictionsGraphMini
            data={[{"progress":0.5,"conviction":100},{"progress":0.5,"conviction":0}]}
            outcome_a="Not 50%"
            outcome_b="50%:50%"
            y_divs={10}
        />


        <br /><br />
        Third graph is opposite of third graph for fair coin.


        <br /><br />
        Conviction by probability of getting a head:
        <PredictionsGraphMini
            data={[{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":10}]}
            outcome_a="0% chance to get a head"
            outcome_b="100% chance to get a head"
            y_divs={10}
        />


        <br /><br />
        Fourth graph is the opposite of fourth graph for fair coin<br />
        You are 100% sure it will be a head or a tail.<br />
        And that you are 0% sure it will be 50% as likely to get a head instead of a tail. <br />
        (Note: this graph isn't quite right because the 50% category should be infinitely narrow instead of 45-55%). <br />






        <div style={{ clear: "both" }}></div> <hr />

        <br /><br />
        Back to the fair coin, now we plan to flip it again. <br />

        Chance of getting 2 tails (with fair coin) in a row:
        <PredictionsGraphMini
            data={[{"progress":0.5,"conviction":75},{"progress":0.5,"conviction":25}]}
            outcome_a="Some other result"
            outcome_b="2 Tails"
            y_divs={8}
        />


        <br /><br />
        Conviction by probability of getting 2 tails: <br/>
        <PredictionsGraphMini
            data={[{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":100},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":0}]}
            outcome_a="0% chance of getting 2 tails"
            outcome_b="100% chance of getting 2 tails"
            y_divs={21}
        />



        <br /><br />
        With the weighted coin we also flip it again. <br />
        If we forgot what the first flip is then: <br />

        Chance of getting 2 tails (with weighted coin) in a row:
        <PredictionsGraphMini
            data={[{"progress":0.5,"conviction":75},{"progress":0.5,"conviction":25}]}
            outcome_a="Some other result"
            outcome_b="2 Tails"
            y_divs={8}
            invalid={true}
        />

        But we actually have almost 0% confidence in this answer.  It is not absolutely 0 because if the coin had some probability for giving a heads then there is a non-0 chance of it flipping 2 heads.  But this single answer <b>is not very useful</b> as it does not contain all the other possible values... it misses alot of the knowledge.

        <br /><br />
        <div style={{ textDecoration: "line-through" }}>
        Chance of getting 2 tails (with weighted coin) in a row:

        <PredictionsGraphMini
            data={[{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":0},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762},{"progress":0.045454545454545456,"conviction":4.761904761904762}]}
            outcome_a="0% of 2 Tails"
            outcome_b="100% of 2 Tails"
            y_divs={21}
            invalid={true}
        />

        (Note: again this graph isn't quite right because the 75% category should be infinitely narrow).
        </div>

        <br /><br />
        Chance of getting 2 tails (with weighted coin) in a row:

        <PredictionsGraphMini
            data={[{"progress":0.047619047619047616,"conviction":40},{"progress":0.047619047619047616,"conviction":25},{"progress":0.047619047619047616,"conviction":15},{"progress":0.047619047619047616,"conviction":10},{"progress":0.047619047619047616,"conviction":10},{"progress":0.047619047619047616,"conviction":5},{"progress":0.047619047619047616,"conviction":10},{"progress":0.047619047619047616,"conviction":10},{"progress":0.047619047619047616,"conviction":10},{"progress":0.047619047619047616,"conviction":10},{"progress":0.047619047619047616,"conviction":10},{"progress":0.047619047619047616,"conviction":10},{"progress":0.047619047619047616,"conviction":15},{"progress":0.047619047619047616,"conviction":15},{"progress":0.047619047619047616,"conviction":15},{"progress":0.047619047619047616,"conviction":15},{"progress":0.047619047619047616,"conviction":20},{"progress":0.047619047619047616,"conviction":20},{"progress":0.047619047619047616,"conviction":25},{"progress":0.047619047619047616,"conviction":30},{"progress":0.047619047619047616,"conviction":40}]}
            outcome_a="0% of 2 Tails"
            outcome_b="100% of 2 Tails"
            y_divs={21}
            invalid={false}
        />

        Initially I thought it was the previous graph but the 25% probability is not 0 unless there is a 100% chance of getting a head, or a 100% of a tail.  As we do not know how the coin is weighted, if we assume there is a uniform chance of it having any non-50% probability of heads then I think it would produce this probability graph.








        <div style={{ clear: "both" }}></div> <hr />

        <div>
            I have a special coin <br/>
            1 coin flip
        </div>
        <PredictionsGraphMini
            data={[{"progress":0.5,"conviction":10},{"progress":0.5,"conviction":10}]}
            outcome_a="Do not get heads or tails"
            outcome_b="Get heads or tails"
            y_divs={10}
        />

        <div style={{ clear: "both" }}></div> <hr />
        <div>
            Many flips <br />
            2 Coin flips:
        </div>

        <PredictionsGraphMini
            data={[{"progress":0.3333333333333333,"conviction":50},{"progress":0.3333333333333333,"conviction":100},{"progress":0.3333333333333333,"conviction":50}]}
            outcome_a="2 Heads"
            outcome_b="2 Tails"
            y_divs={10}
        />


        7 Coin flips:
        <PredictionsGraphMini
            data={[{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":20},{"progress":0.09090909090909091,"conviction":50},{"progress":0.09090909090909091,"conviction":80},{"progress":0.09090909090909091,"conviction":90},{"progress":0.09090909090909091,"conviction":100},{"progress":0.09090909090909091,"conviction":90},{"progress":0.09090909090909091,"conviction":80},{"progress":0.09090909090909091,"conviction":50},{"progress":0.09090909090909091,"conviction":20},{"progress":0.09090909090909091,"conviction":10}]}
            outcome_a="Heads"
            outcome_b="Tails"
            y_divs={10}
        />

        100 Coin flips:
        <PredictionsGraphMini
            data={[{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":30},{"progress":0.09090909090909091,"conviction":70},{"progress":0.09090909090909091,"conviction":100},{"progress":0.09090909090909091,"conviction":70},{"progress":0.09090909090909091,"conviction":30},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":10},{"progress":0.09090909090909091,"conviction":0}]}
            outcome_a="Heads"
            outcome_b="Tails"
            y_divs={10}
        />

        Infinite Coin flips:
        <PredictionsGraphMini
            data={[{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":100},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0},{"progress":0.09090909090909091,"conviction":0}]}
            outcome_a="Heads"
            outcome_b="Tails"
            y_divs={10}
        />

        </div>

        <div style={{ clear: "both" }}></div> <hr />


        <div style={{ clear: "both" }}></div> <hr />

    </div>
    */
}
