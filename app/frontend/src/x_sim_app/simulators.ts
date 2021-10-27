import type {
    ScenarioGroupRunArgs,
    ScenarioGroupRunResult,
    ScenarioRunResult,
    ScenarioRunStopReason,
} from "./scenario_run_results"



export interface BeerGameArgs
{
    consumers_initial_demand: number
    consumers_demand_increase_delay_days: number
    consumers_increased_demand: number

    retailer_initial_price: number
    retailer_initial_balance: number
    retailer_initial_stock: number
    retailer_storage: number

    wholesaler_initial_price: number

    distributor_initial_price: number

    manufacturer_initial_price: number
    manufacturing_delay_in_days: number

    demand_signal_multiplier: number
    days_between_stock_take: number
    transport_time_in_days: number
}

export interface SimulationResult_BeerGame
{
    total_customer_demand: number
    customer_demand_fulfilled_percentage: number
    all_companies_solvent: boolean
    total_company_profit: number
}


interface Simulator<Args, Results>
{
    schedule_sim: (scenario_group_args: ScenarioGroupRunArgs, args: Args, upsert_state: (scenario_group_run_result: ScenarioGroupRunResult<Results>) => void) => void
}


let scenario_group_run = 0
export const beer_game_simulator: Simulator<BeerGameArgs, SimulationResult_BeerGame> = {
    schedule_sim: (scenario_group_args: ScenarioGroupRunArgs, args: BeerGameArgs, upsert_state: (scenario_group_run_result: ScenarioGroupRunResult<SimulationResult_BeerGame>) => void) =>
    {
        let results: ScenarioRunResult<SimulationResult_BeerGame>[] = []

        const scenario_group_run_result: ScenarioGroupRunResult<SimulationResult_BeerGame> = {
            id: `${++scenario_group_run}`,
            started: new Date(),
            ...scenario_group_args,
            total_completed: 0,
            results,
        }

        upsert_state(scenario_group_run_result)

        const upsert_result = (result: ScenarioRunResult<SimulationResult_BeerGame>) =>
        {
            results = [...results, result]
            upsert_state({
                ...scenario_group_run_result,
                total_completed: results.length,
                results,
            })
        }

        run_sims(scenario_group_run_result, args, upsert_result)
    }
}



async function run_sims (scenario_group_args: ScenarioGroupRunArgs, args: BeerGameArgs, upsert_result: (scenario_run_result: ScenarioRunResult<SimulationResult_BeerGame>) => void)
{
    const { total_to_run, max_sim_time_seconds } = scenario_group_args

    for (let i = 0; i < total_to_run; ++i)
    {
        const result = run_simulation__beer_game(max_sim_time_seconds, args)
        upsert_result(result)
    }
}



function run_simulation__beer_game (max_sim_time_seconds: number, args: BeerGameArgs): ScenarioRunResult<SimulationResult_BeerGame>
{
    const seconds_in_day = 3600 * 24
    const max_sim_days = max_sim_time_seconds / seconds_in_day


    const actor_customers = get_new_actor_customers(args)
    const actor_retailer = get_new_actor_retailer(args)
    const actor_wholesaler = get_new_actor_wholesaler(args)
    const actor_distributor = get_new_actor_distributor(args)
    const actor_manufacturer = get_new_actor_manufacturer(args)


    let stop_reason: ScenarioRunStopReason = "time_limit"
    let existing_messages_by_day: { [day: number]: ActorMessage[] } = {}
    let day = 0
    for (; day < max_sim_days; ++day)
    {
        if (stop_reason === "end_condition") break

        let iteration = 0

        console.group(`day: ${day}`)

        do
        {
            ++iteration

            const current_messages = existing_messages_by_day[day] || []
            delete existing_messages_by_day[day] // clear messages that will be processed

            const all_new_messages = [
                ...actor_customers.process(day, iteration, current_messages),
                ...actor_retailer.process(day, iteration, current_messages),
                ...actor_wholesaler.process(day, iteration, current_messages),
                ...actor_distributor.process(day, iteration, current_messages),
                ...actor_manufacturer.process(day, iteration, current_messages),
            ]

            existing_messages_by_day = add_messages_by_delivery_day(existing_messages_by_day, day, all_new_messages)

            console .log("iteration", iteration, "current_messages", current_messages, "all_new_messages", all_new_messages, "existing_messages_by_day", existing_messages_by_day)

            // Instrumentation
            // * Calculate variance of orders to get bullwhip effect

            const should_stop = actor_customers.get_end_condition_met()
                || actor_retailer.get_end_condition_met()
                || actor_wholesaler.get_end_condition_met()
                || actor_distributor.get_end_condition_met()
                || actor_manufacturer.get_end_condition_met()

            if (should_stop)
            {
                stop_reason = "end_condition"
                break
            }
        }
        while (existing_messages_by_day[day]?.length)

        console.groupEnd()
    }


    const all_companies_solvent = actor_retailer.get_is_solvent()
        && actor_wholesaler.get_is_solvent()
        && actor_distributor.get_is_solvent()
        && actor_manufacturer.get_is_solvent()


    const total_company_profit = actor_retailer.get_company_profit()
        + actor_wholesaler.get_company_profit()
        + actor_distributor.get_company_profit()
        + actor_manufacturer.get_company_profit()


    const scenario_run_result: ScenarioRunResult<SimulationResult_BeerGame> = {
        started: new Date(),
        sim_time_seconds: day * seconds_in_day,
        status: "complete",
        stop_reason,
        result: {
            total_customer_demand: actor_customers.get_total_customer_demand(),
            customer_demand_fulfilled_percentage: actor_customers.get_customer_demand_fulfilled_percentage(),
            all_companies_solvent,
            total_company_profit,
        },
    }

    return scenario_run_result
}



function add_messages_by_delivery_day (existing_messages_by_day: { [day: number]: ActorMessage[] }, current_day: number, all_new_messages: ActorMessage[])
{
    validate_new_messages(all_new_messages)

    existing_messages_by_day = {...existing_messages_by_day}

    all_new_messages.forEach(message =>
    {
        const target_day = current_day + message.delivery_delay_days
        let existing_messages = existing_messages_by_day[target_day] || []
        existing_messages = [...existing_messages, message]
        existing_messages_by_day[target_day] = existing_messages
    })

    return existing_messages_by_day
}

function validate_new_messages (all_new_messages: ActorMessage[])
{
    const invalid_message = all_new_messages.find(m => m.delivery_delay_days < 0)
    if (invalid_message)
    {
        throw new Error(`Invalid message`)
    }
}



interface ActorProcess
{
    process: (day: number, iteration: number, messages: ActorMessage[]) => ActorMessage[]
    get_end_condition_met: () => boolean
}



interface ActorMessage
{
    type: string
    delivery_delay_days: number // must be greater than 0
}
function factory_is_a_message <M extends ActorMessage> (type: M["type"])
{
    return function (m: ActorMessage): m is M
    {
        return m.type === type
    }
}



type DemandOrigin = "consumer" | "retailer" | "wholesaler" | "distributor"
type DemandFulfiler = "retailer" | "wholesaler" | "distributor" | "manufacturer"
type ActorType = DemandOrigin | DemandFulfiler

type AcceptDemandFromMap = {[business in DemandFulfiler]: DemandOrigin}
const accept_demand_from_map: AcceptDemandFromMap = {
    retailer: "consumer",
    wholesaler: "retailer",
    distributor: "wholesaler",
    manufacturer: "distributor",
}

type AcceptProductFromMap = {[business in ActorType]: DemandFulfiler | undefined}
const accept_product_from_map: AcceptProductFromMap = {
    consumer: "retailer",
    retailer: "wholesaler",
    wholesaler: "distributor",
    distributor: "manufacturer",
    manufacturer: undefined,
}



interface ProductDemandMessage extends ActorMessage
{
    type: "product_demand"
    origin: DemandOrigin
    demand: number
}
const is_a_product_demand_message = factory_is_a_message<ProductDemandMessage>("product_demand")

interface ProductDemandFulfilmentMessage extends ActorMessage
{
    type: "product_demand_fulfilment"
    origin: DemandFulfiler
    demand_fulfilled: number
    // demand_unfulfilled: number
}
const is_a_product_demand_fulfilment_message = factory_is_a_message<ProductDemandFulfilmentMessage>("product_demand_fulfilment")



interface CustomerActorProcess extends ActorProcess
{
    get_total_customer_demand: () => number
    get_customer_demand_fulfilled_percentage: () => number
}
function get_new_actor_customers (args: BeerGameArgs): CustomerActorProcess
{
    const { consumers_initial_demand, consumers_demand_increase_delay_days, consumers_increased_demand } = args

    const accept_product_from = accept_product_from_map["consumer"]
    let total_customer_demand = 0
    let total_customer_fulfilled_demand = 0

    return {
        process: (day: number, iteration: number, messages: ActorMessage[]) =>
        {
            const return_messages: ActorMessage[] = []

            if (iteration === 1)
            {
                const demand = day < consumers_demand_increase_delay_days
                    ? consumers_initial_demand
                    : consumers_increased_demand

                total_customer_demand += demand

                const product_demand_message: ProductDemandMessage = {
                    type: "product_demand", origin: "consumer", delivery_delay_days: 0, demand
                }
                console .log(`consumer demanded ${demand}`)

                return_messages.push(product_demand_message)
            }


            messages.forEach(message =>
            {
                if (is_a_product_demand_fulfilment_message(message) && message.origin === accept_product_from)
                {
                    total_customer_fulfilled_demand += message.demand_fulfilled
                    console .log(`consumer recieved ${message.demand_fulfilled}`)
                }
            })


            return return_messages
        },
        get_end_condition_met: () => false,
        get_total_customer_demand: () => total_customer_demand,
        get_customer_demand_fulfilled_percentage: () =>
        {
            return (total_customer_fulfilled_demand / total_customer_demand) * 100
        },
    }
}



interface CommonBusinessState
{
    balance: number
    stock: number
    storage: number
    pending_delivery: number
    stock_to_dispatch: number
    target_stock_level: number
    spoiled_stock: number
}
interface CommonBusinessStateGetSet
{
    get_balance: () => number
    set_balance: (num: number) => void
    get_stock: () => number
    set_stock: (num: number) => void
    get_storage: () => number
    // set_storage: (num: number) => void
    get_pending_delivery: () => number
    set_pending_delivery: (num: number) => void
    get_stock_to_dispatch: () => number
    set_stock_to_dispatch: (num: number) => void
    get_target_stock_level: () => number
    // set_target_stock_level: (num: number) => void

    is_solvent: () => boolean
    get_profit: () => number
    get_spoiled_stock: () => number
}
function get_common_business_starting_state (args: BeerGameArgs): CommonBusinessStateGetSet
{
    const initial_balance = args.retailer_initial_balance
    const stock = args.retailer_initial_stock
    const storage = args.retailer_storage
    const target_stock_level = Math.round(storage * 0.8)
    const spoiled_stock = 0

    const state: CommonBusinessState = {
        balance: initial_balance,
        stock,
        storage,
        pending_delivery: 0,
        stock_to_dispatch: 0,
        target_stock_level,
        spoiled_stock,
    }


    function check_positive (val: number): number
    {
        if (val < 0) throw new Error(`val: ${val} < 0`)
        return val
    }


    return {
        get_balance: () => state.balance,
        set_balance: (val: number) => state.balance = val,
        get_stock: () => state.stock,
        set_stock: (val: number) =>
        {
            state.stock = check_positive(val)
            const excess = state.stock - state.storage
            if (excess > 0)
            {
                state.spoiled_stock += excess
                state.stock = state.storage
            }
        },
        get_storage: () => state.storage,
        // set_storage: (val: number) => state.storage = check_positive(val),
        get_pending_delivery: () => state.pending_delivery,
        set_pending_delivery: (val: number) => state.pending_delivery = check_positive(val),
        get_stock_to_dispatch: () => state.stock_to_dispatch,
        set_stock_to_dispatch: (val: number) => state.stock_to_dispatch = check_positive(val),
        get_target_stock_level: () => state.target_stock_level,
        // set_target_stock_level: (val: number) => state.target_stock_level = val,

        is_solvent: () => state.balance >= 0, // dubious definition of solvent!
        get_profit: () => state.balance - initial_balance,
        get_spoiled_stock: () => state.spoiled_stock,
    }
}



function common_business_message_processor (business: DemandFulfiler, state: CommonBusinessStateGetSet, args: BeerGameArgs, messages: ActorMessage[]): ActorMessage[]
{
    const return_messages: ActorMessage[] = []

    const accept_demand_from = accept_demand_from_map[business]
    const accept_product_from = accept_product_from_map[business]

    messages.forEach(message =>
    {
        if (is_a_product_demand_message(message) && message.origin === accept_demand_from)
        {
            const product_demand_fulfilment_message = dispatch_stock(business, state, message.demand, args)
            return_messages.push(product_demand_fulfilment_message)
        }

        if (is_a_product_demand_fulfilment_message(message) && message.origin === accept_product_from)
        {
            const stock = state.get_stock()
            const new_stock_level = stock + message.demand_fulfilled
            console .log(`${business} got delivery ${stock} -> ${new_stock_level}`)
            state.set_stock(new_stock_level)
        }
    })

    return return_messages
}



function dispatch_stock (business: DemandFulfiler, state: CommonBusinessStateGetSet, demand: number, args: BeerGameArgs): ActorMessage
{
    if (demand <= 0) throw new Error("Demand must be greater than 0 to dispatch")

    const stock = state.get_stock()
    const demand_fulfilled = Math.min(demand, stock)
    state.set_stock(stock - demand_fulfilled)

    const demand_unfulfilled = demand - demand_fulfilled
    const stock_to_dispatch = state.get_stock_to_dispatch()
    state.set_stock_to_dispatch(stock_to_dispatch + demand_unfulfilled)
    const delivery_delay_days = business === "retailer" ? 0 : args.transport_time_in_days

    const price = get_price_of_sellers_product(business, args)

    const balance = state.get_balance()
    const charged = demand_fulfilled * price
    const new_balance = balance + charged
    state.set_balance(new_balance)


    console .log(`${business} got demand ${demand}, fulfilled: ${demand_fulfilled} for ${charged}$ now has ${new_balance}$`)


    const product_demand_fulfilment_message: ProductDemandFulfilmentMessage = {
        type: "product_demand_fulfilment",
        origin: business,
        delivery_delay_days,
        demand_fulfilled,
        // demand_unfulfilled
    }

    return product_demand_fulfilment_message
}



function get_price_of_sellers_product (business: DemandFulfiler | undefined, args: BeerGameArgs)
{
    const price = business === "retailer" ? args.retailer_initial_price
        : business === "wholesaler" ? args.wholesaler_initial_price
        : business === "distributor" ? args.distributor_initial_price
        : business === "manufacturer" ? args.manufacturer_initial_price
        // assume 0 manufacturing cost for now
        : business === undefined ? 0 : 0 // args.manufacturing_cost : 0

    if (price < 0) throw new Error(`Price should always be >= 0`)

    return price
}



function common_business_day_processor (business: DemandFulfiler, state: CommonBusinessStateGetSet, args: BeerGameArgs, day: number, iteration: number, demand_product?: (required: number) => void): ActorMessage[]
{
    const return_messages: ActorMessage[] = []


    const stock_to_dispatch = state.get_stock_to_dispatch()
    if (stock_to_dispatch && state.get_stock())
    {
        // Dispatch any stock yet to dispatch
        const demand = Math.min(stock_to_dispatch, state.get_stock())
        state.set_stock_to_dispatch(stock_to_dispatch - demand)

        const product_demand_fulfilment_message = dispatch_stock(business, state, demand, args)
        console .log(`^^ ${business} shipped late product ^^`)
        return_messages.push(product_demand_fulfilment_message)
    }


    if (iteration === 1)
    {
        if ((day % args.days_between_stock_take) === 0)
        {
            const pending_delivery = state.get_pending_delivery()
            const required = (state.get_target_stock_level() - (state.get_stock() + pending_delivery)) * args.demand_signal_multiplier

            const seller = accept_product_from_map[business]
            const price = get_price_of_sellers_product(seller, args)

            const would_cost = required * price
            const balance = state.get_balance()
            const can_afford = (would_cost <= balance) ? required : Math.floor(balance / price)
            const new_balance = balance - (can_afford * price)
            state.set_balance(new_balance)

            if (can_afford > 0)
            {
                if (business !== "manufacturer")
                {
                    const product_demand_message: ProductDemandMessage = {
                        type: "product_demand",
                        origin: business,
                        delivery_delay_days: 0,
                        demand: can_afford
                    }

                    state.set_pending_delivery(pending_delivery + can_afford)

                    return_messages.push(product_demand_message)
                }


                if (demand_product) demand_product(can_afford)
            }
        }
    }

    return return_messages
}



interface RetailerActorProcess extends ActorProcess
{
    get_is_solvent: () => boolean
    get_company_profit: () => number
}
function get_new_actor_retailer (args: BeerGameArgs): RetailerActorProcess
{
    const business: DemandFulfiler = "retailer"
    const state = get_common_business_starting_state(args)

    return {
        process: (day: number, iteration: number, messages: ActorMessage[]) =>
        {
            let return_messages = common_business_message_processor(business, state, args, messages)

            const more_messages = common_business_day_processor(business, state, args, day, iteration)
            return_messages = return_messages.concat(more_messages)

            return return_messages
        },
        get_end_condition_met: () => !state.is_solvent(),
        get_is_solvent: () => state.is_solvent(),
        get_company_profit: () => state.get_profit(),
    }
}



interface WholesalerActorProcess extends ActorProcess
{
    get_is_solvent: () => boolean
    get_company_profit: () => number
}
function get_new_actor_wholesaler (args: BeerGameArgs): WholesalerActorProcess
{
    const business: DemandFulfiler = "wholesaler"
    const state = get_common_business_starting_state(args)

    return {
        process: (day: number, iteration: number, messages: ActorMessage[]) =>
        {
            let return_messages = common_business_message_processor(business, state, args, messages)

            const more_messages = common_business_day_processor(business, state, args, day, iteration)
            return_messages = return_messages.concat(more_messages)

            return return_messages
        },
        get_end_condition_met: () => !state.is_solvent(),
        get_is_solvent: () => state.is_solvent(),
        get_company_profit: () => state.get_profit(),
    }
}



interface DistributorActorProcess extends ActorProcess
{
    get_is_solvent: () => boolean
    get_company_profit: () => number
}
function get_new_actor_distributor (args: BeerGameArgs): DistributorActorProcess
{
    const business: DemandFulfiler = "distributor"
    const state = get_common_business_starting_state(args)

    return {
        process: (day: number, iteration: number, messages: ActorMessage[]) =>
        {
            let return_messages = common_business_message_processor(business, state, args, messages)

            const more_messages = common_business_day_processor(business, state, args, day, iteration)
            return_messages = return_messages.concat(more_messages)

            return return_messages
        },
        get_end_condition_met: () => !state.is_solvent(),
        get_is_solvent: () => state.is_solvent(),
        get_company_profit: () => state.get_profit(),
    }
}



interface ManufacturerActorProcess extends ActorProcess
{
    get_is_solvent: () => boolean
    get_company_profit: () => number
}
function get_new_actor_manufacturer (args: BeerGameArgs): ManufacturerActorProcess
{
    const business: DemandFulfiler = "manufacturer"
    const state = get_common_business_starting_state(args)

    const manufacturing: {[day: number]: number} = {}


    return {
        process: (day: number, iteration: number, messages: ActorMessage[]) =>
        {
            if (iteration === 1)
            {
                const stock = state.get_stock()
                const new_stock_level = stock + (manufacturing[day] || 0)
                if (new_stock_level > stock) console .log("Manufactuer made new_stock ", stock, new_stock_level)
                state.set_stock(new_stock_level)
            }

            let return_messages = common_business_message_processor(business, state, args, messages)

            const manufacture_goods = (can_afford: number) =>
            {
                const day_products_will_be_available = day + args.manufacturing_delay_in_days
                if (manufacturing[day_products_will_be_available])
                {
                    throw new Error(`Already making goods for day: ${day_products_will_be_available}`)
                }
                // No limit to demand that can be manufactured
                if (can_afford) console .log("Manufactuer scheduling to make new_stock ", can_afford)
                manufacturing[day_products_will_be_available] = can_afford
            }

            const more_messages = common_business_day_processor(business, state, args, day, iteration, manufacture_goods)
            return_messages = return_messages.concat(more_messages)

            return return_messages
        },
        get_end_condition_met: () => !state.is_solvent(),
        get_is_solvent: () => state.is_solvent(),
        get_company_profit: () => state.get_profit(),
    }
}
