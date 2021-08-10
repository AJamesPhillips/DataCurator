import { h } from "preact"

import { Modal } from "../modal/Modal"
import { AutocompleteProps, AutocompleteText } from "../form/Autocomplete/AutocompleteText"



interface OwnProps extends AutocompleteProps {
    search_window_title: string
    on_blur: () => void
}


export function SearchWindow (props: OwnProps)
{
    return <Modal
        on_close={() => props.on_blur && props.on_blur()}
        title={props.search_window_title}
        child={() => <div>
            <br />
            <br />

            <AutocompleteText
                placeholder={props.placeholder}
                selected_option_id={props.selected_option_id}
                initial_search_term={props.initial_search_term}
                options={props.options}
                allow_none={props.allow_none}
                on_change={option_id =>
                {
                    props.on_change(option_id)
                    props.on_blur && props.on_blur()
                }}
                on_mouse_over_option={props.on_mouse_over_option}
                on_mouse_leave_option={props.on_mouse_leave_option}
                extra_styles={props.extra_styles}
                start_expanded={true}
            />
        </div>}
    />
}
