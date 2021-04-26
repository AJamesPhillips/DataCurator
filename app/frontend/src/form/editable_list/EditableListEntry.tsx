import { Component, h } from "preact"

import "./EditableListEntry.css"
import { ConfirmatoryDeleteButton } from "../ConfirmatoryDeleteButton"
import { EditableCustomDateTime } from "../EditableCustomDateTime"



interface OwnProps<T>
{
    item: T
    get_created_at: (item: T) => Date
    get_custom_created_at?: (item: T) => Date | undefined
    set_custom_created_at?: (item: T, new_custom_created_at: Date | undefined) => T
    get_summary: (item: T, on_change: (item: T) => void) => h.JSX.Element
    get_details: (item: T, on_change: (item: T) => void) => h.JSX.Element
    get_details2?: (item: T, on_change: (item: T) => void) => h.JSX.Element
    expanded?: boolean
    disable_collapsable?: boolean
    on_change: (item: T) => void
    delete_item?: () => void
    extra_class_names?: string
}



interface State
{
    internal__expanded: boolean
}


export class EditableListEntry <T> extends Component<OwnProps<T>, State>
{
    constructor (props: OwnProps<T>)
    {
        super(props)
        this.state = {
            internal__expanded: !!props.expanded,
        }
    }

    componentDidUpdate (prev_props: OwnProps<T>, prev_state: State)
    {
        if (this.props.expanded !== prev_props.expanded)
        {
            this.setState({ internal__expanded: !!this.props.expanded })
        }
    }

    render ()
    {
        const {
            item,
            get_created_at,
            get_custom_created_at,
            set_custom_created_at = (item, custom_created_at) => ({ ...item, custom_created_at }),
            get_summary,
            get_details,
            get_details2,
            disable_collapsable,
            on_change,
            delete_item,
        } = this.props

        const created_at = get_created_at(item)
        const custom_created_at = get_custom_created_at ? get_custom_created_at(item) : undefined

        const { internal__expanded } = this.state


        const class_name__not_collapsable = disable_collapsable ? "not_collapsable" : ""
        const class_name__expanded = internal__expanded ? "expanded" : ""
        const extra_class_names = this.props.extra_class_names || ""
        const class_name = `editable_list ${class_name__not_collapsable} ${class_name__expanded} ${extra_class_names}`


        const date_on_change = (new_custom_created_at: Date | undefined) =>
        {
            on_change(set_custom_created_at(item, new_custom_created_at))
        }

        return <div className={class_name}>
            <div className="expansion_button" onClick={() => this.setState({ internal__expanded: !internal__expanded })}></div>

            <div className="summary">
                {get_summary(item, on_change)}
            </div>

            <div className="details">
                {get_details(item, on_change)}

                <ConfirmatoryDeleteButton on_delete={delete_item} />

                {get_custom_created_at && <EditableCustomDateTime
                    invariant_value={created_at}
                    value={custom_created_at}
                    on_change={date_on_change}
                />}
            </div>

            <div className="details2">
                {get_details2 && get_details2(item, on_change)}
            </div>
        </div>
    }
}
