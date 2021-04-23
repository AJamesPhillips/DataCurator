import { Component, ComponentClass, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { Canvas } from "../canvas/Canvas"
import type { CanvasPoint } from "../canvas/interfaces"
import { KnowledgeViewController } from "../knowledge_view/knowledge_view_controller"
import { ObjectivesViewController } from "../objectives/objectives_view_controller"
import { PrioritiesViewController } from "../priorities/priorities_view_controller"
import type { ViewType } from "../state/routing/interfaces"
import type { RootState } from "../state/State"
import { memoize } from "../utils/memoize"
import { performance_logger } from "../utils/performance"
import type { IViewController } from "./interfaces"
import { MainArea } from "./MainArea"


interface OwnProps {}


const map_state = (state: RootState) =>
{
    const view = state.routing.args.view

    return { view }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


type State = { display: { [ view_type in ViewType]: boolean } } & {
    latest_request_to_update: number
}

class _MainAreaRouter extends Component<Props, State>
{
    private priorities_view_controller: IViewController
    private knowledge_view_controller: IViewController
    private objectives_view_controller: IViewController

    constructor (props: Props)
    {
        super(props)

        this.priorities_view_controller = PrioritiesViewController(this.view_needs_to_update)
        this.knowledge_view_controller = KnowledgeViewController(this.view_needs_to_update)
        this.objectives_view_controller = ObjectivesViewController(this.view_needs_to_update)

        this.state = {
            display: {
                priorities: false,
                knowledge: false,
                objectives: false,
            },
            latest_request_to_update: 0,
        }
    }


    static getDerivedStateFromProps (props: Props, state: State)
    {
        return {
            display: {
                priorities: props.view === "priorities",
                knowledge: props.view === "knowledge",
                objectives: props.view === "objectives",
            }
        }
    }


    view_needs_to_update = () =>
    {
        this.setState({ latest_request_to_update: performance.now() })
    }


    view_to_controller (view: ViewType | undefined): IViewController | undefined
    {
        if (view === "priorities") return this.priorities_view_controller
        if (view === "knowledge") return this.knowledge_view_controller
        if (view === "objectives") return this.objectives_view_controller

        return undefined
    }


    get_svg_children ()
    {
        return merge_lists_c(
            this.priorities_view_controller.get_svg_children(),
            this.knowledge_view_controller.get_svg_children(),
            this.objectives_view_controller.get_svg_children(),
        )
    }


    get_children_and_content_coordinates ()
    {
        const priorities = this.priorities_view_controller.get_children()
        const knowledge = this.knowledge_view_controller.get_children()
        const objectives = this.objectives_view_controller.get_children()

        // Is this cache even working anymore?
        const children = merge_lists_c(
            priorities.element,
            knowledge.element,
            objectives.element,
        )

        let content_coordinates: CanvasPoint[] = []

        if (this.props.view === "priorities") content_coordinates = priorities.content_coordinates
        if (this.props.view === "knowledge") content_coordinates = knowledge.content_coordinates
        if (this.props.view === "objectives") content_coordinates = objectives.content_coordinates

        return { children, content_coordinates }
    }


    get_svg_upper_children ()
    {
        return merge_lists_c(
            this.priorities_view_controller.get_svg_upper_children(),
            this.knowledge_view_controller.get_svg_upper_children(),
            this.objectives_view_controller.get_svg_upper_children(),
        )
    }


    get_content_controls ()
    {
        return merge_lists_c(
            this.priorities_view_controller.get_content_controls(),
            this.knowledge_view_controller.get_content_controls(),
            this.objectives_view_controller.get_content_controls(),
        )
    }


    render ()
    {
        performance_logger("MainAreaRouter...")
        const primary_view_controller = this.view_to_controller(this.props.view)

        if (!primary_view_controller) return <div>404 Unknown view: {this.props.view}</div>

        this.priorities_view_controller.update_display_status(this.state.display.priorities)
        this.knowledge_view_controller.update_display_status(this.state.display.knowledge)
        this.objectives_view_controller.update_display_status(this.state.display.objectives)

        const svg_children = this.get_svg_children()
        const { children, content_coordinates } = this.get_children_and_content_coordinates()
        const svg_upper_children = this.get_svg_upper_children()

        return <MainArea
            main_content={<Canvas
                svg_children={svg_children}
                svg_upper_children={svg_upper_children}
                content_coordinates={content_coordinates}
            >
                {children}
            </Canvas>}

            main_content_controls={this.get_content_controls()}
        />
    }
}


export const MainAreaRouter = connector(_MainAreaRouter) as ComponentClass<OwnProps>


const merge_lists_c = memoize(merge_lists, { cache_limit: 1 })

function merge_lists (...args: (h.JSX.Element | null)[]): h.JSX.Element[]
{
    return args.filter(a => !!a) as h.JSX.Element[]
}
