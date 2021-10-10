import { Component, FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import Markdown, { MarkdownToJSX } from "markdown-to-jsx"

import { add_newlines_to_markdown } from "../form/utils"
import { replace_ids_in_text } from "../wcomponent/rich_text/get_rich_text"
import { get_wc_id_counterfactuals_v2_map } from "../state/derived/accessor"
import type { RootState } from "../state/State"
import { AnchorTag } from "./AnchorTag"



interface OwnProps
{
    text: string
    placeholder?: string
}

const map_state = (state: RootState) => ({
    rich_text: state.display_options.consumption_formatting,
    wcomponents_by_id: state.specialised_objects.wcomponents_by_id,
    wc_id_counterfactuals_map: get_wc_id_counterfactuals_v2_map(state),
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


class _RichMarkDown extends Component <Props>
{

    render ()
    {
        const { text, rich_text, wcomponents_by_id, wc_id_counterfactuals_map, placeholder = "...",
            created_at_ms, sim_ms,
        } = this.props

        const value = replace_ids_in_text({
            text, rich_text, wcomponents_by_id, wc_id_counterfactuals_map, created_at_ms, sim_ms
        })
        return <Markdown options={MARKDOWN_OPTIONS}>
            {(value && add_newlines_to_markdown(value)) || placeholder}
        </Markdown>
    }
}

export const RichMarkDown = connector(_RichMarkDown) as FunctionalComponent<OwnProps>



export const MARKDOWN_OPTIONS: MarkdownToJSX.Options =
{
    overrides:
    {
        a: { component: AnchorTag },
        script: (props: { children: string }) => props.children,
        // This allows us to render `<auto generated>` as an empty string
        auto: (props: { children: string }) => "",
    },
}
