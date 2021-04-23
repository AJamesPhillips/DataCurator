import { Component, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import "./EditableListEntry.css"
import type { RootState } from "../../state/State"
import { ConfirmatoryDeleteButton } from "../ConfirmatoryDeleteButton"
import { EditableCustomDateTime } from "../EditableCustomDateTime"



interface OwnProps<T>
{
    item: T
    get_created_at: (item: T) => Date
    get_custom_created_at?: (item: T) => Date | undefined
    set_custom_created_at?: (item: T, new_custom_created_at: Date | undefined) => T
    get_summary: (item: T, on_change: (item: T) => void, editing_new_item: boolean) => h.JSX.Element
    get_details: (item: T, on_change: (item: T) => void, editing_new_item: boolean) => h.JSX.Element
    get_details2?: (item: T, on_change: (item: T) => void, editing_new_item: boolean) => h.JSX.Element
    expanded?: boolean
    disable_collapsable?: boolean
    editing_new_item?: boolean
    on_change: (item: T) => void
    delete_item?: () => void
    extra_class_names?: string
}



const map_state = (state: RootState) => ({
    datetime_ms: state.routing.args.created_at_ms,
})



const connector = connect(map_state)
type Props<T> = ConnectedProps<typeof connector> & OwnProps<T>


interface State
{
    internal__expanded: boolean
}


class _EditableListEntry <T> extends Component<Props<T>, State>
{
    constructor (props: Props<T>)
    {
        super(props)
        this.state = {
            internal__expanded: !!props.expanded,
        }
    }

    componentDidUpdate (prev_props: Props<T>, prev_state: State)
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
            datetime_ms,
            disable_collapsable,
            editing_new_item = false,
            on_change,
            delete_item,
        } = this.props

        const created_at = get_created_at(item)
        const custom_created_at = get_custom_created_at ? get_custom_created_at(item) : undefined

        const {
            internal__expanded,
        } = this.state


        const created_datetime_ms = (custom_created_at || created_at).getTime()
        const class_name__display = editing_new_item ? "" :
            (created_datetime_ms > datetime_ms
                ? " in_future "
                : (created_datetime_ms === datetime_ms ? " focused " : ""))

        const class_name__not_collapsable = disable_collapsable ? " not_collapsable " : ""
        const class_name__expanded = internal__expanded ? " expanded " : ""
        const extra_class_names = " " + (this.props.extra_class_names || "") + " "

        const class_name = "editable_list " + class_name__not_collapsable + class_name__expanded + class_name__display + extra_class_names

        const date_on_change = (new_custom_created_at: Date | undefined) =>
        {
            on_change(set_custom_created_at(item, new_custom_created_at))
        }

        return <div className={class_name}>
            <div className="expansion_button" onClick={() => this.setState({ internal__expanded: !internal__expanded })}></div>

            <div className="summary">
                {get_summary(item, on_change, editing_new_item)}
            </div>

            <div className="details">
                {get_details(item, on_change, editing_new_item)}

                <ConfirmatoryDeleteButton on_delete={delete_item} />

                {get_custom_created_at && <EditableCustomDateTime
                    invariant_value={created_at}
                    value={custom_created_at}
                    on_change={date_on_change}
                />}
            </div>

            <div className="details2">
                {get_details2 && get_details2(item, on_change, editing_new_item)}
            </div>
        </div>
    }
}


const _EditableListEntry2 = connector(_EditableListEntry)
export function EditableListEntry<T> (own_props: OwnProps<T>)
{
    return <_EditableListEntry2 {...own_props}/>
}
