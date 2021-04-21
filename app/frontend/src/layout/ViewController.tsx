import { h } from "preact"
import type { Store, Action } from "redux"

import type { RootState } from "../state/State"
import { config_store } from "../state/store"
import { bounded } from "../utils/utils"
import type { ChildrenData, ChildrenRawData, IViewController } from "./interfaces"


const opacity_step_change = 0.004


interface ViewControllerArgs<Props, State>
{
    view_needs_to_update: () => void
    map_state: (state: RootState) => Props
    get_initial_state: () => State
    get_svg_children?: (props: Props, state: State, set_state: (s: Partial<State>) => void) => h.JSX.Element[]
    get_children?: (props: Props, state: State, set_state: (s: Partial<State>) => void) => ChildrenRawData
    get_svg_upper_children?: (props: Props, state: State, set_state: (s: Partial<State>) => void) => h.JSX.Element[]
    get_content_controls?: (props: Props, state: State, set_state: (s: Partial<State>) => void) => h.JSX.Element[]
}


export class ViewController<Props, State> implements IViewController
{
    protected props: Props
    private view_needs_to_update: () => void
    private map_state: (state: RootState) => Props
    private state: State
    private _get_svg_children: (props: Props, state: State, set_state: (s: Partial<State>) => void) => h.JSX.Element[]
    private _get_children: (props: Props, state: State, set_state: (s: Partial<State>) => void) => ChildrenRawData
    private _get_svg_upper_children: (props: Props, state: State, set_state: (s: Partial<State>) => void) => h.JSX.Element[]
    private _get_content_controls: (props: Props, state: State, set_state: (s: Partial<State>) => void) => h.JSX.Element[]

    private store: Store<RootState, Action<any>>

    constructor (args: ViewControllerArgs<Props, State>)
    {
        this.view_needs_to_update = args.view_needs_to_update
        this.map_state = args.map_state
        this.state = args.get_initial_state()
        this._get_svg_children = args.get_svg_children || (() => [])
        this._get_children = args.get_children || (() => ({ elements: [], content_coordinates: [] }))
        this._get_svg_upper_children = args.get_svg_upper_children || (() => [])
        this._get_content_controls = args.get_content_controls || (() => [])

        const store = config_store()
        this.store = store
        this.props = this.map_state(this.store.getState())
        store.subscribe(() => { if (this.content_visible()) this.update_props() })
    }


    private update_props = () =>
    {
        const old_props = this.props
        const new_props = this.map_state(this.store.getState())

        const diff = object_values_changed(old_props, new_props)
        if (diff)
        {
            this.props = new_props
            this.view_needs_to_update()
        }
    }


    private set_state = (s: Partial<State>) =>
    {
        const old_state = this.state
        const new_state = { ...this.state, ...s }

        const diff = object_values_changed(old_state, new_state)
        if (diff)
        {
            this.state = new_state
            this.view_needs_to_update()
        }
    }


    private opacity = 0
    private should_display = false

    private ref_svg_children: SVGElement | null = null
    private ref_children: HTMLElement | null = null
    private ref_svg_upper_children: SVGElement | null = null
    private ref_content_controls: HTMLElement | null = null
    private set_ref_svg_children = (ref_svg_children: SVGElement | null) =>
    {
        this.ref_svg_children = ref_svg_children
        this.update_children_opacity()
    }
    private set_ref_children = (ref_children: HTMLElement | null) =>
    {
        this.ref_children = ref_children
        this.update_children_opacity()
    }
    private set_ref_svg_upper_children = (ref_svg_upper_children: SVGElement | null) =>
    {
        this.ref_svg_upper_children = ref_svg_upper_children
        this.update_children_opacity()
    }
    private set_ref_content_controls = (ref_content_controls: HTMLElement | null) =>
    {
        this.ref_content_controls = ref_content_controls
        this.update_children_opacity()
    }


    private timeout_update_children_opacity: NodeJS.Timeout | undefined
    private update_children_opacity = () =>
    {
        if (this.timeout_update_children_opacity) return

        this.opacity += (opacity_step_change * (this.should_display ? 1 : -1))
        this.opacity = bounded(this.opacity, 0, 1)

        const style = (this.opacity === 0) ? `display: none;` : `opacity: ${this.opacity};`

        this.ref_svg_children?.setAttribute("style", style)
        this.ref_children?.setAttribute("style", style)
        this.ref_svg_upper_children?.setAttribute("style", style)

        const content_control_style = this.should_display ? "" : `display: none;`
        this.ref_content_controls?.setAttribute("style", content_control_style)

        if (!this.opacity_synced())
        {
            setTimeout(() =>
            {
                this.timeout_update_children_opacity = undefined
                this.update_children_opacity()
            }, 30)
        }
    }


    private opacity_synced = () => this.opacity === (this.should_display ? 1 : 0)
    private content_invisible = () => !this.should_display && this.opacity_synced()
    private content_visible = () => !this.content_invisible()


    update_display_status = (should_display: boolean) =>
    {
        const should_update_props = should_display && should_display != this.should_display
        this.should_display = should_display
        // Due to only updating props when content_visible (see:
        //    `store.subscribe(() => { if (this.content_visible()) this.update_props() }))`
        // We update_props here in case they have become stale
        if (should_update_props) this.update_props()
    }


    get_svg_children = (): h.JSX.Element | null =>
    {
        if (this.content_invisible()) return null


        return <g ref={ref => this.set_ref_svg_children(ref)}>
            {this._get_svg_children(this.props, this.state, this.set_state)}
        </g>
    }


    get_children = (): ChildrenData =>
    {
        if (this.content_invisible()) return { element: null, content_coordinates: [] }


        const { elements, content_coordinates } = this._get_children(this.props, this.state, this.set_state)

        return {
            element: <div ref={ref => this.set_ref_children(ref)}>
                {elements}
            </div>,
            content_coordinates,
        }
    }

    get_svg_upper_children = (): h.JSX.Element | null =>
    {
        if (this.content_invisible()) return null


        return <g ref={ref => this.set_ref_svg_upper_children(ref)}>
            {this._get_svg_upper_children(this.props, this.state, this.set_state)}
        </g>
    }


    get_content_controls = () =>
    {
        if (this.content_invisible()) return null


        return <div ref={ref => this.set_ref_content_controls(ref)}>
            {this._get_content_controls(this.props, this.state, this.set_state)}
        </div>
    }

}


function object_values_changed<P> (object1: P, object2: P): boolean
{
    if (Object.keys(object1).length !== Object.keys(object2).length) return true

    for (const object1_key in object1) {
        const diff = (object1 as any)[object1_key] !== (object2 as any)[object1_key]
        if (diff) return true
    }

    return false
}
