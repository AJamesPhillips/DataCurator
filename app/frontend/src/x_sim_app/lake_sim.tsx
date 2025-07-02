import { useMemo, useState } from "preact/hooks"

type Values = { [component_name: string]: number }
type GetValue = (component_name: string) => number

function factory_get_value(values: Values)
{
  return (component_name: string): number =>
  {
    const value = values[component_name]
    if (value === undefined)
    {
      throw new Error(`Component "${component_name}" not found in values`)
    }
    return value
  }
}


type RateFunction = (current_time: number, get_value: GetValue) => number
type ActionFunction = (current_time: number, get_value: GetValue) => Values


function calculate_new_flow_rates(
  stock_components: { [component_name: string]: PreparedStockComponent },
  flow_components: { [component_name: string]: FlowComponent },
  current_time: number,
  sim_config: SimConfig
): Values
{
  const stock_values: Values = {}
  Object.entries(stock_components).forEach(([component_name, component]) => {
    stock_values[component_name] = component.value
  })

  let new_flow_rate_values = calculate_new_flow_rate_values(
    flow_components,
    stock_values,
    current_time,
  )

  if (sim_config.integration_method === "euler")
  {
    // Already calculated the new flow rate values above
  }
  else if (sim_config.integration_method === "rk4")
  {
    // Calculate k1, k2, k3, k4 for each flow component
    const k1: Values = new_flow_rate_values
    // Update stock values with yn​ + k1​​/2
    let time_step_size = sim_config.time_step / 2
    const stock_values_for_k2 = calc_stock_values_given_k(k1, stock_components, time_step_size)

    const k2: Values = calculate_new_flow_rate_values(
      flow_components,
      stock_values_for_k2,
      current_time + time_step_size
    )

    // Update stock values with yn​ + k2​​/2
    time_step_size = sim_config.time_step / 2
    const stock_values_for_k3 = calc_stock_values_given_k(k2, stock_components, time_step_size)
    const k3: Values = calculate_new_flow_rate_values(
      flow_components,
      stock_values_for_k3,
      current_time + time_step_size
    )

    // Update stock values with yn​ + k3​​
    time_step_size = sim_config.time_step
    const stock_values_for_k4 = calc_stock_values_given_k(k3, stock_components, time_step_size)
    const k4: Values = calculate_new_flow_rate_values(
      flow_components,
      stock_values_for_k4,
      current_time + time_step_size
    )

    const k: Values = {}
    for (const flow_component_name of Object.keys(flow_components))
    {
      k[flow_component_name] = (k1[flow_component_name]! + 2 * k2[flow_component_name]! + 2 * k3[flow_component_name]! + k4[flow_component_name]!) / 6
    }

    new_flow_rate_values = k
  }
  else
  {
    throw new Error(`Unknown integration method "${sim_config.integration_method}"`)
  }

  return new_flow_rate_values
}


function calculate_new_flow_rate_values(
  flow_components: { [component_name: string]: FlowComponent },
  stock_values: Values,
  current_time: number
)
{
  const new_values: Values = {}

  const get_value = factory_get_value(stock_values)

  for (const [flow_component_name, flow_component] of Object.entries(flow_components))
  {
    const rate = flow_component.rate(current_time, get_value)
    new_values[flow_component_name] = rate
  }
  return new_values
}


function calc_stock_values_given_k(
  k_step_values: Values,
  stock_components: { [component_name: string]: PreparedStockComponent },
  time_step_size: number,
): Values
{
  const stock_values_for_k_step: Values = {}

  for (const [stock_component_name, stock_component] of Object.entries(stock_components))
  {
    const new_stock_value = calc_new_stock_value(stock_component, k_step_values, time_step_size)
    stock_values_for_k_step[stock_component_name] = new_stock_value
  }
  return stock_values_for_k_step
}


function calc_new_stock_value(
  component: PreparedStockComponent,
  k_values: Values,
  time_step_size: number
): number
{
  // Calculate the new stock value based on the flow rates
  const in_flow = component.in_flows.reduce((sum, flow_component_name) => sum + k_values[flow_component_name]!, 0)
  const out_flow = component.out_flows.reduce((sum, flow_component_name) => sum + k_values[flow_component_name]!, 0)
  const net_flow = in_flow - out_flow

  let new_value = component.value + (time_step_size * net_flow)

  // Check if the stock component allows negative values
  if (!component.allow_negative)
  {
    new_value = Math.max(new_value, 0) // Prevent negative values
  }

  return new_value
}


type Component = StockComponent | FlowComponent | ActionComponent

interface StockComponent
{
  type: "stock"
  initial_value: number
  allow_negative?: boolean
}
interface FlowComponent
{
  type: "flow"
  source_component: string
  sink_component: string
  rate: RateFunction
}
interface ActionComponent
{
  type: "action"
  action: ActionFunction
}
interface Components
{
  [component_name: string]: Component
}
function is_stock_component (component: Component): component is StockComponent
{
  return component.type === "stock"
}
function is_flow_component (component: Component): component is FlowComponent
{
  return component.type === "flow"
}
function is_action_component (component: Component): component is ActionComponent
{
  return component.type === "action"
}


interface PreparedStockComponent
{
  value: number
  allow_negative: boolean
  in_flows: string[] // component names of inflows
  out_flows: string[] // component names of inflows
}

type IntegrationMethod = "euler" | "rk4"
interface SimConfig
{
  start_time: number
  time_step: number
  integration_method: IntegrationMethod
}
interface ModelArgs
{
  sim_config: SimConfig
  components: Components
}
interface StepResults
{
  time: number
  values: Values
}

interface Model
{
  initial_values(): Values
  action(action_name: string): void
  simulation_step: () => StepResults
}

function initialise_model(args: ModelArgs): Model
{
  let { sim_config, components } = args
  // Copy args to avoid mutation
  sim_config = { ...sim_config }
  components = { ...components }
  Object.entries(components).forEach(([component_name, component]) => {
    components[component_name] = { ...component }
  })

  let current_time = sim_config.start_time

  const stock_components: {[component_name: string]: StockComponent} = {}
  const flow_components: {[component_name: string]: FlowComponent} = {}
  const action_components: {[component_name: string]: ActionComponent} = {}
  Object.entries(components).forEach(([component_name, component]) => {
    if (is_stock_component(component)) stock_components[component_name] = component
    else if (is_flow_component(component)) flow_components[component_name] = component
    else if (is_action_component(component)) action_components[component_name] = component
    else throw new Error(`Component ${component_name} must be either a stock or flow component`)
  })


  // Initialize stock component values
  const initial_values: Values = {}
  const prepared_stock_components: { [component_name: string]: PreparedStockComponent} = {}
  for (const [component_name, component] of Object.entries(stock_components))
  {
    if (component.initial_value === undefined) {
      throw new Error(`Component ${component_name} must have an initial_value defined`)
    }

    prepared_stock_components[component_name] =
    {
      value: component.initial_value,
      // Default to false if not specified
      allow_negative: component.allow_negative ?? false,
      in_flows: [],
      out_flows: []
    }

    initial_values[component_name] = component.initial_value
  }
  let current_values: Values = { ...initial_values }


  // Initialise flow components and set up their relationships
  for (const [component_name, component] of Object.entries(flow_components))
  {
    // Check if source and sink components are valid stock components
    if (component.source_component)
    {
      const source_component = prepared_stock_components[component.source_component]
      if (!source_component)
      {
        throw new Error(`Flow component ${component_name} references unknown source component "${component.source_component}"`)
      }

      source_component.out_flows.push(component_name)
    }

    if (component.sink_component)
    {
      const sink_component = prepared_stock_components[component.sink_component]
      if (!sink_component)
      {
        throw new Error(`Flow component ${component_name} references unknown sink component "${component.sink_component}"`)
      }

      sink_component.in_flows.push(component_name)
    }
  }


  return {
    initial_values: () => initial_values,
    action: (action_name: string) =>
    {
      const action_component = action_components[action_name]
      if (!action_component)
      {
        throw new Error(`Action component "${action_name}" not found`)
      }

      const get_value = factory_get_value(current_values)
      const new_values = action_component.action(current_time, get_value)

      current_values = {
        ...current_values,
        ...new_values,
      }
    },
    simulation_step: () =>
    {
      current_time += sim_config.time_step
      console.log(`Simulation step at time: ${current_time}`)

      // Update stock component values
      for (const [component_name, component] of Object.entries(prepared_stock_components))
      {
        component.value = current_values[component_name]!
      }

      // Calculate new flow rates
      const new_flow_rate_values: Values = calculate_new_flow_rates(
        prepared_stock_components,
        flow_components,
        current_time,
        sim_config
      )
      const new_stock_values = calc_stock_values_given_k(
        new_flow_rate_values,
        prepared_stock_components,
        sim_config.time_step
      )

      current_values = {
        ...new_flow_rate_values,
        ...new_stock_values,
      }

      return { time: current_time, values: current_values }
    }
  }
}



/////////////////////////////////////////////////////////////////////


function GraphData({ results }: { results: Array<{ x: number, y: number }> })
{
  const width = 500
  const height = 400
  const x_offset = 60
  const y_offset = height - 50

  const min_x = Math.min(0, ...results.map(point => point.x))
  const max_x = Math.max(1, ...results.map(point => point.x))
  const min_y = Math.min(0, ...results.map(point => point.y))
  const max_y = Math.max(1, ...results.map(point => point.y))

  // Avoid division by zero
  const x_range = max_x - min_x || 1
  const y_range = max_y - min_y || 1

  // Padding for axes
  const plot_width = width - x_offset - 50
  const plot_height = height - 80

  // Map data to SVG coordinates
  const get_cx = (x: number) =>
    x_offset + ((x - min_x) / x_range) * plot_width

  const get_cy = (y: number) =>
    y_offset - ((y - min_y) / y_range) * plot_height

  return (
    <svg width={width} height={height}>
      {/* X axis */}
      <line x1={x_offset} y1={y_offset} x2={width} y2={y_offset} stroke="black" />
      {/* Y axis */}
      <line x1={x_offset} y1={y_offset} x2={x_offset} y2={10} stroke="black" />

      {/* Min/Max X labels */}
      <text x={x_offset} y={y_offset + 18} fontSize="12" textAnchor="middle" fill="#333">
        {min_x.toFixed(2)}
      </text>
      <text x={x_offset + plot_width} y={y_offset + 18} fontSize="12" textAnchor="middle" fill="#333">
        {max_x.toFixed(2)}
      </text>

      {/* Min/Max Y labels */}
      <text x={x_offset - 8} y={y_offset} fontSize="12" textAnchor="end" alignmentBaseline="middle" fill="#333">
        {min_y.toFixed(2)}
      </text>
      <text x={x_offset - 8} y={y_offset - plot_height} fontSize="12" textAnchor="end" alignmentBaseline="middle" fill="#333">
        {max_y.toFixed(2)}
      </text>

      {/* Lines */}
      {results.map((point, index) => (
        index > 0 && (
          <line
            key={index}
            x1={get_cx(results[index - 1]!.x)}
            y1={get_cy(results[index - 1]!.y)}
            x2={get_cx(point.x)}
            y2={get_cy(point.y)}
            stroke="lightblue"
          />
        )
      ))}

      {/* Points */}
      {results.map((point, index) => (
        <circle
          key={index}
          cx={get_cx(point.x)}
          cy={get_cy(point.y)}
          r="3"
          fill="blue"
        />
      ))}
    </svg>
  )
}


/////////////////////////////////////////////////////////////////////

const get_lake_model1 = (): ModelArgs =>
{
  interface LakeComponents extends Components
  {
    lake_volume: Component
    lake_outflow: Component
  }

  const components: LakeComponents = {
    lake_volume: { type: "stock", initial_value: 100 },
    // TODO: change to variable
    lake_volume_below_outflow: { type: "stock", initial_value: 50 },
    // TODO: change to variable
    lake_outflow_multiplier: { type: "stock", initial_value: 0.01 },
    lake_outflow: {
      type: "flow",
      source_component: "lake_volume",
      sink_component: "",
      rate: (t, get_value) =>
      {
        const current_value = get_value("lake_volume")
        if (current_value <= get_value("lake_volume_below_outflow")) return 0 // No outflow if volume is less than 50 cubic meters
        return current_value * get_value("lake_outflow_multiplier") // Outflow rate is 1% of the lake volume
      }
    },
    action_rain: {
      type: "action",
      action: (current_time, get_value) =>
      {
        const lake_volume = get_value("lake_volume")
        const new_lake_volume = lake_volume + 10 // Add 10 cubic meters of water when it rains
        return { lake_volume: new_lake_volume }
      }
    },
  }

  return {
    sim_config: {
      start_time: 0,
      time_step: 1,
      integration_method: "euler" // Choose between "euler" or "rk4"
    },
    components,
  }
}


const get_lake_model2 = (): ModelArgs =>
{
  // Matches model made here: https://docs.google.com/spreadsheets/d/1Cx2InRCWkTasjzM2Wd3S81oDM344Y_Uy41ki30c-Fhg/edit?gid=1521800484#gid=1521800484
  const components: Components = {
    lake_volume_middle: { type: "stock", initial_value: 50 },
    lake_volume_lower: { type: "stock", initial_value: 0 },
    flow_middle_lake_inflow: {
      type: "flow",
      source_component: "",
      sink_component: "lake_volume_middle",
      rate: (t, get_value) => 1,
    },
    flow_middle_lake_outflow: {
      type: "flow",
      source_component: "lake_volume_middle",
      sink_component: "lake_volume_lower",
      rate: (t, get_value) =>
      {
        const current_value = get_value("lake_volume_middle")
        if (current_value <= 50) return 0 // No outflow if volume is less than 50 cubic meters
        return 10
      }
    },
  }

  return {
    sim_config: {
      start_time: 0,
      time_step: 1,
      integration_method: "rk4" // Choose between "euler" or "rk4"
    },
    components,
  }
}



function LakeSim1 ()
{
  const lake_model = useMemo(() =>
  {
    return initialise_model(get_lake_model1())
  }, [])

  interface Result
  {
    time: number
    lake_volume: number
  }
  const [results, set_results] = useState<Result[]>(() =>
    [{ time: 0, lake_volume: lake_model.initial_values()["lake_volume"]! }])

  function run_simulation_steps(steps = 1)
  {
    const new_results: Result[] = []
    for (let i = 0; i < steps; i++)
    {
      const r = lake_model.simulation_step()
      new_results.push({time: r.time, lake_volume: r.values.lake_volume!})
    }

    set_results(results =>
    {
      return [...results, ...new_results]
    })
  }

  return <div>
    <h1>Lake Simulation 1</h1>
    <button onClick={() => run_simulation_steps()}>Run Simulation step</button>
    <button onClick={() => run_simulation_steps(10)}>Run 10</button>
    <button onClick={() => lake_model.action("action_rain")}>Rain</button>
    <br/>
    <div style={{ margin: 20 }}>
      <GraphData results={results.map(d => ({ x: d.time, y: d.lake_volume }))} />
    </div>
  </div>
}


function LakeSim2 ()
{
  const lake_model = useMemo(() =>
  {
    return initialise_model(get_lake_model2())
  }, [])

  interface Result
  {
    time: number
    lake_volume_middle: number
    lake_volume_lower: number
  }
  const [results, set_results] = useState<Result[]>(() =>
    [{
      time: 0,
      lake_volume_middle: lake_model.initial_values()["lake_volume_middle"]!,
      lake_volume_lower: lake_model.initial_values()["lake_volume_lower"]!,
    }])

  function run_simulation_steps(steps = 1)
  {
    const new_results: Result[] = []
    for (let i = 0; i < steps; i++)
    {
      const r = lake_model.simulation_step()
      new_results.push({
        time: r.time,
        lake_volume_middle: r.values.lake_volume_middle!,
        lake_volume_lower: r.values.lake_volume_lower!,
      })
    }

    set_results(results =>
    {
      return [...results, ...new_results]
    })
  }

  return <div>
    <h1>Lake Simulation 2</h1>
    <button onClick={() => run_simulation_steps()}>Run Simulation step</button>
    <button onClick={() => run_simulation_steps(10)}>Run 10</button>
    <br/>
    <div style={{ margin: 20 }}>
      <GraphData results={results.map(d => ({ x: d.time, y: d.lake_volume_middle }))} />
      <GraphData results={results.map(d => ({ x: d.time, y: d.lake_volume_lower }))} />
    </div>
  </div>
}


export function LakeSim ()
{
  const [lake_sim, set_lake_sim] = useState<"1" | "2" | null>(null)

  if (lake_sim === null)
  {
    return <div>
      <h1>Lake Simulations</h1>
      <button onClick={() => set_lake_sim("1")}>Lake Sim 1</button>
      <button onClick={() => set_lake_sim("2")}>Lake Sim 2</button>
    </div>
  }

  if (lake_sim === "2") return <LakeSim2 />

  return <LakeSim1/>
}
