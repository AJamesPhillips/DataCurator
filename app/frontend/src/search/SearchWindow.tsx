import { h } from "preact"

import "./SearchWindow.css"
import { Modal } from "../modal/Modal"
import { AutocompleteProps, AutocompleteText } from "../form/AutocompleteText"



interface OwnProps extends AutocompleteProps {
    search_window_title: string
    start_expanded?: undefined
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
                on_focus={props.on_focus}
                on_blur={props.on_blur}
                on_change={props.on_change}
                on_mouse_over_option={props.on_mouse_over_option}
                on_mouse_leave_option={props.on_mouse_leave_option}
                extra_styles={props.extra_styles}
                start_expanded={true}
            />
        </div>}
    >
    </Modal>
}
