import { Component, FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import Markdown from "markdown-to-jsx"

import type { RootState } from "../state/State"
import { add_newlines_to_markdown } from "../form/utils"
import { replace_ids_in_text } from "../shared/models/get_rich_text"



interface OwnProps
{
    text: string
    placeholder: string
}

const map_state = (state: RootState) => ({
    rich_text: state.display.rich_text_formatting,
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


class _RichMarkDown extends Component <Props>
{

    render ()
    {
        const { text, rich_text, wcomponents_by_id, placeholder } = this.props

        const value = replace_ids_in_text({ text, rich_text, wcomponents_by_id })
        return <Markdown>
            {(value && add_newlines_to_markdown(value)) || placeholder}
        </Markdown>
    }
}

export const RichMarkDown = connector(_RichMarkDown) as FunctionalComponent<OwnProps>
