import { Component, h } from "preact"

import { AutocompleteOption, AutocompleteText } from "./AutocompleteText"



export interface MultiAutocompleteProps <E extends AutocompleteOption = AutocompleteOption>
{
    placeholder: string
    selected_option_ids: string[]
    initial_search_term?: string
    options: E[]
    allow_none?: boolean
    on_focus?: () => void
    on_blur?: () => void
    on_change: (ids: E["id"][]) => void
    on_mouse_over_option?: (id: E["id"] | undefined) => void
    on_mouse_leave_option?: (id: E["id"] | undefined) => void
    extra_styles?: h.JSX.CSSProperties
    start_expanded?: boolean
}



interface OwnProps <E extends AutocompleteOption> extends MultiAutocompleteProps <E> {}



export class MultiAutocompleteText <E extends AutocompleteOption> extends Component <OwnProps<E>>
{
    render ()
    {
        const { selected_option_ids } = this.props

        const options = this.props.options.filter(({ id }) => !selected_option_ids.includes(id))

        return <div>
            <AutocompleteText
                {...this.props}
                selected_option_id={undefined}
                options={options}
                on_change={id =>
                {
                    if (id === undefined) return
                    this.props.on_change([...selected_option_ids, id])
                }}
            />
            {selected_option_ids.join(" , ")}
        </div>
    }
}
