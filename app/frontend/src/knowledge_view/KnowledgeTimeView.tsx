import { FunctionalComponent, h, render } from "preact"

import "./KnowledgeTimeView.scss"
import type { ChildrenRawData } from "../layout/interfaces"
import type { RootState } from "../state/State"
import { WComponentCanvasNode } from "../knowledge/canvas_node/WComponentCanvasNode"
import { MainArea } from "../layout/MainArea"
import { connect, ConnectedProps } from "react-redux"
import { sort_list } from "../shared/utils/sort"
import { WComponent, wcomponent_has_VAP_sets } from "../shared/wcomponent/interfaces/SpecialisedObjects"
import { get_created_at_ms } from "../shared/wcomponent/utils_datetime"
import { Box } from "@material-ui/core"
import { ConnectedValueAndPredictionSetSummary } from "../knowledge/multiple_values/ConnectedValueAndPredictionSetSummary"


const map_state = (state: RootState) =>
{
    const sync_ready = state.sync.ready

    const { current_composed_knowledge_view: current_composed_knowledge_view } = state.derived

    if (sync_ready && !current_composed_knowledge_view) console .log(`No current_composed_knowledge_view`)

    const { selected_wcomponent_ids_map } = state.meta_wcomponents

    const cdate:Date = new Date(state.routing.args.created_at_ms)
    const sdate:Date = new Date(state.routing.args.sim_ms)

    let wcomponent_nodes: WComponent[] = []

    if (current_composed_knowledge_view)
    {
        wcomponent_nodes = current_composed_knowledge_view.wcomponent_nodes
    }
    window.addEventListener('scroll', (e) => {
        console.log(e)
    })


    return {
        sync_ready,
        wcomponent_nodes,
        wcomponent_connections: current_composed_knowledge_view && current_composed_knowledge_view.wcomponent_connections,
        presenting: state.display_options.consumption_formatting,
        selected_wcomponent_ids_map,
        cdate: cdate,
        sdate: sdate
    }
}

const connector = connect(map_state)
type Props = ConnectedProps<typeof connector>

class DateRange {
    _ms(ms:number, convert:boolean=true):any {
        const operator = (convert) ? "/" : "*"
        return {
            milliseconds: ms,
            get seconds() { return eval(`${ms} ${operator} 1000`) },
            get minutes() { return eval(`${this.seconds} ${operator} 60`) },
            get hours() { return eval(`${this.minutes} ${operator} 60`) },
            get days() { return eval(`${this.hours} ${operator} 24`) },
            get months() { return eval(`${this.days} ${operator} 365 / 12`) },
            get years() { return eval(`${this.days} ${operator} 365`) },
            // get weeks() { return eval(`${this.days} ${operator} 7`) },
        }
    }
    scale:string = "months"
    single_time_units = this._ms(1, false)
    scales:string[] = Object.keys(this.single_time_units)
    get scale_index():number { return this.scales.indexOf(this.scale) }

    dates:Date[] = []

    increment(date:Date, count:number = 1):Date {
        let new_date = new Date(date.getTime())
        let fn = this.get_date_prop_func_names(this.scale)
        Object(new_date)[fn.set](Object(new_date)[fn.get]() + count)
        return new_date
    }

    // get_range_dates_for(target_date:Date = this.cdate):Date[] {
    //     let start_date = this.round_date(target_date)
    //     let end_date = this.round_date(target_date, true)
    //     return [start_date, end_date]
    // }

    get range_dates():Date[] {
        let dates:Date[] = []
        let start_date = this.round_date(this.start_date)
        let end_date = this.round_date(this.end_date)
        dates.push(start_date)

        dates.push(end_date)
        return dates;

    }

    get start_date():Date {
        const d:any = this.dates.slice(0)[0]
        return (typeof d === typeof (new Date())) ? d : new Date()
    }
    get end_date():Date {
        const d:any = this.dates.slice(-1)[0]
        return (typeof d === typeof (new Date())) ? d : new Date()
    }

    get range_start_date():Date {
        const d:any = this.range_dates.slice(0)[0]
        return (typeof d === typeof (new Date())) ? d : new Date()
    }

    get range_end_date():Date {
        const d:any = this.range_dates.slice(-1)[0]
        return (typeof d === typeof (new Date())) ? d : new Date()
    }

    get_date_offset_percent(date:Date):number {
        let percent:number = 0;
        let date_ms:number = date.getTime()
        let start_ms:number = this.range_start_date.getTime()
        let end_ms:number = this.range_end_date.getTime()

        percent = ((date_ms - start_ms) / (end_ms - start_ms)) * 100
        // console.group(date.toDateString())
        // console.log(`${this.range_start_date.toDateString()} • ${this.range_end_date.toDateString()} • ${percent}`)
        // // console.log(`((${date_ms} - ${start_ms}) / (${end_ms} - ${start_ms})) * 100  EQUALS: ${percent}` )
        // console.groupEnd()
        // if (this.range_start_date && this.range_end_date) {
        //     // percent = ((date.getTime() - this.range_start_date.getTime()) / (this.range_end_date.getTime() - this.range_start_date.getTime())) * 100

        // }
        return percent
    }

    get_date_prop_func_names(date_unit:string):Record<string, any> {
        let getter, setter:string|null = null
        const prop_name: string = date_unit.charAt(0).toUpperCase() + date_unit.slice(1)
        const date:Date = new Date()
        const default_getter_name:string = `get${prop_name}`
        switch(date_unit) {
            case "days":
                getter = "getDate"
                break
            default:
                if (Object(date)[default_getter_name]) {
                    getter = default_getter_name
                } else if (Object(date)[default_getter_name.replace(/s$/, "")]) {
                    getter = default_getter_name.replace(/s$/, "")
                }
        }
        if (getter) {
            setter = getter.replace(/^get/, "set")
        }
        return {
            get: getter,
            set: setter
        }
    }

    round_date(date:Date, round_up:boolean = false, scale:string=this.scale):Date {
        let rounded_date = new Date(date.getTime())
        this.scales.forEach((scale, i) => {
            const date_prop_fns = this.get_date_prop_func_names(scale)
            const adjusted_value = (scale === 'days') ? 1 : 0
            if (round_up) {
                if (i === this.scale_index) {
                    Object(rounded_date)[date_prop_fns.set](Object(rounded_date)[date_prop_fns.get]() + 1)
                } else if (i < this.scale_index) {
                    Object(rounded_date)[date_prop_fns.set](adjusted_value)
                }
            } else {
                if (i < this.scale_index) {
                    if (date_prop_fns.set && Object(rounded_date)[date_prop_fns.set]) {
                        Object(rounded_date)[date_prop_fns.set](adjusted_value)
                    }
                }
            }
        })
        if (round_up) {
           rounded_date.setTime(rounded_date.getTime() - 1)
        }
        return rounded_date
    }

    cdate:Date = new Date()
    sdate:Date = new Date()
    constructor(dates:Date[], props: Props) {
        this.dates = dates.sort((a:Date, b:Date) => a.getTime() - b.getTime())
        this.cdate = props.cdate;
        this.sdate = props.sdate;
    }
    render(wcomponent_nodes:any[]) {
        let width_percent:number = 100 + (this.get_date_offset_percent(this.start_date) * -1) + this.get_date_offset_percent(this.end_date)
        const container = window.document.getElementById('main_content')
        const container_width:number = (container) ? container.offsetWidth : 0

        const days_in_range:number[] = Array.from(
            { length: (this.range_end_date.getTime() - this.range_start_date.getTime()) / this.single_time_units['days']},
            (v, i) => i
        )
        return(
            <Box
                id="knowledge_time_view"
                className={`time_view scroll_area_x ${this.scale}`}
                flexGrow={1} flexShrink={1}
                position="relative"
                onScroll={(e:Event) => {
                    let scrolled_element:any = e.target
                    let scrolled_offset = scrolled_element.scrollLeft
                    let nodes:HTMLCollection = document.getElementsByClassName('wc')
                    for (let i = 0; i < nodes.length; i++) {
                        const node:any = nodes[i]
                        if (node) {
                            node.style.marginLeft = `${scrolled_offset}px`
                        }
                    }
                    // console.log(scrolled_element.scrollLeft)
                }}
            >

                <Box className="timeline"
                    height={1} maxHeight={1}
                    position="absolute"
                    minWidth={`${width_percent}%`} maxWidth={`${width_percent}%`}
                    top={0} right={`${width_percent}%`} bottom={0} left={0}
                    zIndex={1}
                >
                    <Box
                        width={1} maxWidth={1} border={1}
                        height={1} maxHeight={1}
                        display="flex" flexDirection="row"
                    >
                        {days_in_range.map(d => {
                            let this_date:Date = new Date(this.start_date.getTime())
                            this_date.setDate(d)
                            return (
                                <Box className="unit" flexGrow={1} flexShrink={1} flexBasis="auto" position="relative" overflow="visible">
                                    <Box position="absolute" className="tick" width="1em" height={0} top={0} right="50%">
                                        <Box className="rotater" whiteSpace="nowrap" pl={3} pb={1}>
                                            {this_date.toLocaleDateString()}

                                            {this_date.toLocaleTimeString()}
                                        </Box>
                                    </Box>
                                </Box>
                            )
                        })}
                    </Box>
                </Box>
                <Box
                    minWidth={`${width_percent}%`} maxWidth={`${width_percent}%`}
                    minHeight={1} height={1} maxHeight={1}
                    overflow="hidden"
                >
                    <Box
                        className="scroll_area_y"
                        minWidth={`${width_percent}%`} maxWidth={`${width_percent}%`}
                        position="relative" zIndex={10}
                        height={1} maxHeight={1}
                    >
                        <Box className="contents" mt={50}>
                        {wcomponent_nodes.map(wc => {
                            const VAP_sets = wcomponent_has_VAP_sets(wc) ? wc.values_and_prediction_sets : []
                            const wc_percent:number =  (wc.created_at) ? this.get_date_offset_percent(wc.created_at) : 0

                            return (
                                <Box
                                    width={`${width_percent}%`} maxWidth={`${width_percent}%`}
                                    overflow="hidden"
                                    position="relative"
                                >
                                    <Box id={`WC-${wc.id}`}
                                        className="wc"
                                        display="inline-block"
                                        position="relative"
                                        top={0}
                                    >
                                        <WComponentCanvasNode id={wc.id} on_graph={false} />
                                    </Box>
                                    <Box visibility="hidden" className="hidden_sizer">
                                        <WComponentCanvasNode id={wc.id} on_graph={false} />
                                    </Box>

                                    <Box className="vaps"
                                        width={1} maxWidth={1} overflow="hidden"
                                        minHeight="5em" maxHeight="10em"
                                        mx="auto"
                                        position="relative"
                                    >
                                        {VAP_sets.map((VAP, index) => {
                                            const vap_percent = this.get_date_offset_percent(VAP.created_at)
                                            return (
                                                <Box className="vap"
                                                    display="inline-block"
                                                    mx="auto"
                                                    minHeight="100%" height="100%" maxHeight="100%"
                                                    position="absolute" left={`${vap_percent}%`}
                                                    border={1}
                                                >
                                                    <Box component="small">{vap_percent.toFixed(2)}%</Box><br />
                                                    {/* <ConnectedValueAndPredictionSetSummary wcomponent={wc} VAP_set={VAP} /> */}

                                                    {/* <Box component="small">{vap_percent.toFixed(2)}%</Box><br /> */}
                                                </Box>
                                            )
                                        })}

                                    </Box>
                                </Box>
                            )
                        })}
                        </Box>
                    </Box>
                </Box>
                {/* <Box className={`visible_timeline ${this.scale}`}
                    position="absolute"
                    top={0} right={`${width_percent}%`} bottom={0} left={0}
                    width={`${width_percent}%`} maxWidth={`${width_percent}%`}
                    height={1} maxHeight={1}
                    overflowX="auto" overflowY="hidden"
                >
                    VISIBLE TIMELINE!
                </Box>
                <Box className="scroll_area"
                    minHeight={1} maxHeight={1}
                    width={`${width_percent}%`} maxWidth={`${width_percent}%`}
                >
                    SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br />
                    SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br /> SCROLLAREA <br />

                </Box> */}
            </Box>
        )
        // return(
        //     <Box className={`time_view ${this.scale}`}
        //         position="relative"
        //         flexGrow={1} flexShrink="1"
        //         display="flex" flexDirection="column" alignItems="stretch"
        //         boxSizing="border-box"
        //         width="100%"
        //         overflow="auto"
        //         style="border:2px red solid"
        //     >
        //         <Box className={`visible_timeline ${this.scale}`}
        //             position="absolute"
        //             top={0} right={0} bottom={0} left={0}
        //             display="flex" flexDirection="row"
        //             boxSizing="border-box"
        //             width={`${width_percent}%`} maxWidth={`${width_percent}%`}
        //             minHeight={1} maxHeight={1}
        //             overflow="visible"
        //             style="border:2px orange solid"
        //         >
        //             {days_in_range.map(d => {
        //                 let this_date:Date = new Date(this.start_date.getTime())
        //                 this_date.setDate(d)
        //                 return (
        //                     <Box className="unit" flexGrow={1} flexShrink={1} flexBasis="auto" position="relative" overflow="visible">
        //                         <Box position="absolute" className="tick" width="1em" height={0} top={0} right="50%">
        //                             <Box className="rotater" whiteSpace="nowrap" pl={3} pb={1}>
        //                                 {this_date.toLocaleDateString()}
        //                                 {/* {this_date.toLocaleTimeString()} */}
        //                             </Box>
        //                         </Box>
        //                     </Box>
        //                 )
        //             })}
        //         </Box>
        //         <Box
        //             className="time_view_scrollable_container"
        //             position="relative" zIndex={10}
        //             flexGrow={1} flexShrink={1}
        //             width={1}
        //             mt={50}
        //         >
        //             {wcomponent_nodes.map(wc => {
        //                 const VAP_sets = wcomponent_has_VAP_sets(wc) ? wc.values_and_prediction_sets : []
        //                 const wc_percent:number =  (wc.created_at) ? this.get_date_offset_percent(wc.created_at) : 0

        //                 return (
        //                     <Box
        //                         width={`${width_percent}%`} maxWidth={`${width_percent}%`}
        //                         overflow="hidden"
        //                         position="relative"
        //                     >
        //                         <Box id={`WC-${wc.id}`}
        //                             position="fixed" left={`${wc_percent}%`}
        //                             className="wc"
        //                         >
        //                             <WComponentCanvasNode id={wc.id} on_graph={false} />
        //                         </Box>
        //                         <Box visibility="hidden" className="hidden_sizer">
        //                             <WComponentCanvasNode id={wc.id} on_graph={false} />
        //                         </Box>

        //                         <Box className="vaps"
        //                             width={1} maxWidth={1} overflow="hidden"
        //                             mx="auto"
        //                         >
        //                             <Box className="vap_wrap"
        //                                 p={3}
        //                                 position="relative"
        //                                 minHeight="10em" maxHeight="10em" height="10em"
        //                             >
        //                                 {VAP_sets.map((VAP, index) => {
        //                                     const vap_percent = this.get_date_offset_percent(VAP.created_at)
        //                                     return (
        //                                         <Box className="vap" display="inline-block" mx="auto" minHeight="100%" height="100%" maxHeight="100%" border={1} position="absolute" left={`${vap_percent}%`}>
        //                                             {/* <ConnectedValueAndPredictionSetSummary wcomponent={wc} VAP_set={VAP} /> */}
        //                                             <Box component="small">{VAP.created_at.toLocaleDateString()}</Box><br />
        //                                             <Box component="small">{vap_percent.toFixed(2)}%</Box><br />
        //                                         </Box>
        //                                     )
        //                                 })}
        //                             </Box>
        //                         </Box>
        //                     </Box>
        //                 )
        //             })}
        //         </Box>
        //     </Box>
        // )
    }
}

function _KnowledgeTimeView (props: Props)
{
    // const properties = get_children(props)
    let { wcomponent_nodes } = props
    const { selected_wcomponent_ids_map } = props
    const dates: Date[] = []
    const get_key = (wc: WComponent) =>
    {
        const entry = selected_wcomponent_ids_map[wc.id]
        if (entry !== undefined) return entry
        else return get_created_at_ms(wc)
    }
    wcomponent_nodes = sort_list(wcomponent_nodes, get_key, "ascending")
    wcomponent_nodes.forEach(wc => {
        const VAP_sets = wcomponent_has_VAP_sets(wc) ? wc.values_and_prediction_sets : []
        dates.push(wc.created_at)
        VAP_sets.forEach(VAP => {
            dates.push(VAP.created_at)
        })
    })
    let date_range = new DateRange(dates, props)
    return <MainArea main_content={date_range.render(wcomponent_nodes)} />
}

export const KnowledgeTimeView = connector(_KnowledgeTimeView) as FunctionalComponent<{}>

// const no_children: h.JSX.Element[] = []
// const get_children = (props: Props): ChildrenRawData =>
// {
//     const { sync_ready } = props
//     let { wcomponent_nodes } = props
//     if (!sync_ready || !wcomponent_nodes)
//     {
//         return no_children
//     }


//     const { selected_wcomponent_ids_map } = props
//     const get_key = (wc: WComponent) =>
//     {
//         const entry = selected_wcomponent_ids_map[wc.id]

//         if (entry !== undefined) return entry
//         else return get_created_at_ms(wc)
//     }

//     wcomponent_nodes = sort_list(wcomponent_nodes, get_key, "ascending")


//     const elements: h.JSX.Element[] = []
//     wcomponent_nodes.map(wc =>
//     {
//         const VAP_sets = wcomponent_has_VAP_sets(wc) ? wc.values_and_prediction_sets : []

//         elements.push(
//             <Box
//                 display="flex" flexDirection="row" alignItems="stretch"
//                 py="0.5em"
//                 key={wc.id}
//             >
//                 <WComponentCanvasNode
//                     id={wc.id}
//                     on_graph={false}
//                 />

//                 {VAP_sets.length > 0 && (
//                     <Box p="0.5em"
//                         flexGrow={1} flexShrink={0}
//                         display="flex" alignItems="stretch" alignContent="stretch">
//                         {VAP_sets.map(VAP_set => <ConnectedValueAndPredictionSetSummary wcomponent={wc} VAP_set={VAP_set} />)}
//                     </Box>
//                 )}
//             </Box>
//         )
//     })

//     return elements
// }


const no_svg_upper_children: h.JSX.Element[] = []
const get_svg_upper_children = ({ wcomponent_connections }: Props) =>
{
    return null
    // if (!wcomponent_connections) return no_svg_upper_children

    // return wcomponent_connections.map(({ id }) => <WComponentCanvasConnection key={id} id={id} />)
}
