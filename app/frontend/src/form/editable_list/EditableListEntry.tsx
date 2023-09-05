import { Component, h } from "preact"
import { useMemo } from "preact/hooks"
import { FormControl } from "@mui/material"

import "./EditableListEntry.css"
import { ConfirmatoryDeleteButton } from "../ConfirmatoryDeleteButton"
import { EditableCustomDateTime } from "../EditableCustomDateTime"



/*
 * This is not CRUD as it lacks the R for Read but it's close enough semantically
 * to be useful to people developing against this interface / component API etc.
 */
export interface ListItemCRUD<U>
{
    create_item?: (item: U) => void
    update_item?: (item: U) => void
    delete_item?: (item: U) => void
}
export interface ListItemCRUDRequiredU<U> extends ListItemCRUD<U>
{
    create_item?: (item: U) => void
    update_item: (item: U) => void
    delete_item?: (item: U) => void
}
export interface ListItemCRUDRequiredC<U> extends ListItemCRUD<U>
{
    create_item: (item: U) => void
    update_item?: (item: U) => void
    delete_item?: (item: U) => void
}
export interface ListItemCRUDRequiredCU<U> extends ListItemCRUDRequiredU<U>, ListItemCRUDRequiredC<U>
{
    create_item: (item: U) => void
    update_item: (item: U) => void
    delete_item?: (item: U) => void
}
export interface ListItemCRUDRequiredCUD<U> extends ListItemCRUD<U>
{
    create_item: (item: U) => void
    update_item: (item: U) => void
    delete_item: (item: U) => void
}


export interface EditableListEntryItemProps<U, Crud>
{
    get_created_at?: (item: U) => Date
    get_custom_created_at?: (item: U) => Date | undefined
    set_custom_created_at?: (item: U, new_custom_created_at: Date | undefined) => U
    get_summary: (item: U, crud: Crud) => h.JSX.Element
    get_details: (item: U, crud: Crud) => h.JSX.Element
    get_details2?: (item: U, crud: Crud) => h.JSX.Element
    get_details3?: (item: U, crud: Crud) => h.JSX.Element
    calc_initial_custom_expansion_state?: (item: U) => boolean | undefined
    extra_class_names?: string
    delete_button_text?: string
    crud: Crud
}


interface OwnProps<U, Crud extends ListItemCRUDRequiredU<U>> extends EditableListEntryItemProps<U, Crud>
{
    item: U
    expanded?: boolean
    crud: Crud
}



interface State
{
    internal__expanded: boolean
}


export class EditableListEntry <T, Crud extends ListItemCRUDRequiredU<T>> extends Component<OwnProps<T, Crud>, State>
{
    constructor (props: OwnProps<T, Crud>)
    {
        super(props)

        const { calc_initial_custom_expansion_state: calc_initial_expanded } = props
        const custom_expanded = calc_initial_expanded && calc_initial_expanded(props.item)
        const internal__expanded = custom_expanded !== undefined ? custom_expanded : !!props.expanded

        this.state = { internal__expanded }
    }

    componentDidUpdate (prev_props: OwnProps<T, Crud>, prev_state: State)
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
            crud,
            delete_button_text,
        } = this.props
        const { update_item, delete_item } = crud


        const custom_created_at = get_custom_created_at ? get_custom_created_at(item) : undefined

        const { internal__expanded } = this.state


        const class_name__expanded = internal__expanded ? "expanded" : ""
        const extra_class_names = this.props.extra_class_names || ""
        const class_name = `editable_list_entry ${class_name__expanded} ${extra_class_names}`


        const on_delete = useMemo(() => delete_item && (() => delete_item(item)), [delete_item, item])


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
                    title={internal__expanded ? "Collapse" : "Expand"}
                    onClick={() => this.setState({ internal__expanded: !internal__expanded })}
                />
            </div>

            <div className="details">
                {get_details(item, crud)}

                <div className="details2">
                    {get_details2 && get_details2(item, crud)}
                </div>

                <div>
                    {on_delete && <ConfirmatoryDeleteButton on_delete={on_delete} button_text={delete_button_text} />}

                    <br />
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
