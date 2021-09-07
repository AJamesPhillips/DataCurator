import { Component, h } from "preact"
import { useMemo } from "preact/hooks"
import { FormControl } from "@material-ui/core"

import "./EditableListEntry.css"
import { ConfirmatoryDeleteButton } from "../ConfirmatoryDeleteButton"
import { EditableCustomDateTime } from "../EditableCustomDateTime"



export interface ListItemCRUD<U>
{
    create_item: (item: U) => void
    update_item: (item: U) => void
    delete_item: (item: U) => void
}


export interface EditableListEntryTopProps<U>
{
    get_created_at?: (item: U) => Date
    get_custom_created_at?: (item: U) => Date | undefined
    set_custom_created_at?: (item: U, new_custom_created_at: Date | undefined) => U
    get_summary: (item: U, crud: ListItemCRUD<U>) => h.JSX.Element
    get_details: (item: U, crud: ListItemCRUD<U>) => h.JSX.Element
    get_details2?: (item: U, crud: ListItemCRUD<U>) => h.JSX.Element
    get_details3?: (item: U, crud: ListItemCRUD<U>) => h.JSX.Element
    calc_initial_custom_expansion_state?: (item: U) => boolean | undefined
    extra_class_names?: string
}


interface OwnProps<U> extends EditableListEntryTopProps<U>
{
    item: U
    expanded?: boolean
    disable_collapsable?: boolean
    create_item: (item: U) => void
    update_item: (item: U) => void
    delete_item: () => void
    delete_button_text?: string
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

        const { calc_initial_custom_expansion_state: calc_initial_expanded } = props
        const custom_expanded = calc_initial_expanded && calc_initial_expanded(props.item)
        const internal__expanded = custom_expanded !== undefined ? custom_expanded : !!props.expanded

        this.state = { internal__expanded }
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
            get_details3,
            disable_collapsable,
            create_item,
            update_item,
            delete_item,
            delete_button_text,
        } = this.props


        const crud: ListItemCRUD<T> = useMemo(() => (
            { create_item, update_item, delete_item }
        ), [create_item, update_item, delete_item])


        const custom_created_at = get_custom_created_at ? get_custom_created_at(item) : undefined

        const { internal__expanded } = this.state


        const class_name__not_collapsable = disable_collapsable ? "not_collapsable" : ""
        const class_name__expanded = internal__expanded ? "expanded" : ""
        const extra_class_names = this.props.extra_class_names || ""
        const class_name = `editable_list_entry ${class_name__not_collapsable} ${class_name__expanded} ${extra_class_names}`


        const date_on_change = (new_custom_created_at: Date | undefined) =>
        {
            update_item(set_custom_created_at(item, new_custom_created_at))
        }

        return <div className={class_name}>
            <div className="summary_header">
                <div className="summary">
                    {get_summary(item, crud)}
                </div>

                <div
                    className="expansion_button"
                    onClick={() => this.setState({ internal__expanded: !internal__expanded })}
                />
            </div>

            <div className="details">
                {get_details(item, crud)}

                <div className="details2">
                    {get_details2 && get_details2(item, crud)}
                </div>

                <div>
                    <ConfirmatoryDeleteButton on_delete={delete_item} button_text={delete_button_text} />

                    {(get_created_at || get_custom_created_at) && <FormControl>
                        <EditableCustomDateTime
                            title="Created at"
                            invariant_value={get_created_at && get_created_at(item)}
                            value={custom_created_at}
                            on_change={date_on_change}
                        />
                    </FormControl>}
                </div>

                <div className="details3">
                    {get_details3 && get_details3(item, crud)}
                </div>
            </div>

        </div>
    }
}
