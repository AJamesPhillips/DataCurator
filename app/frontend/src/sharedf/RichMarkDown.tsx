import { Component, FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import Markdown, { MarkdownToJSX } from "markdown-to-jsx"

import { add_newlines_to_markdown } from "../form/utils"
import { get_wc_id_to_counterfactuals_v2_map } from "../state/derived/accessor"
import type { RootState } from "../state/State"
import { replace_ids_in_text } from "../wcomponent_derived/rich_text/get_rich_text"
import { AnchorTag } from "./AnchorTag"
import type { CSSProperties } from "@material-ui/styles"



interface OwnProps
{
    text: string
    placeholder?: string
}

const map_state = (state: RootState) => ({
    rich_text: state.display_options.consumption_formatting,
    composed_wcomponents_by_id: state.derived.composed_wcomponents_by_id,
    knowledge_views_by_id: state.specialised_objects.knowledge_views_by_id,
    wc_id_to_counterfactuals_map: get_wc_id_to_counterfactuals_v2_map(state),
    created_at_ms: state.routing.args.created_at_ms,
    sim_ms: state.routing.args.sim_ms,
})


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps


class _RichMarkDown extends Component <Props>
{

    render ()
    {
        const {
            text, rich_text,
            composed_wcomponents_by_id, knowledge_views_by_id, wc_id_to_counterfactuals_map,
            placeholder = "...",
            created_at_ms, sim_ms,
        } = this.props

        const value = replace_ids_in_text({
            text, rich_text, wcomponents_by_id: composed_wcomponents_by_id, knowledge_views_by_id, wc_id_to_counterfactuals_map, created_at_ms, sim_ms
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
        a: AnchorTag,
        // If there is any text inside the script tag then render this, otherwise render nothing.
        script: (props: { children: string }) => props.children,
        // This allows us to render `<auto generated>` as an empty string
        auto: (props: { children: string }) => "",
        // Re-enable iframes to allow embedding youtube videos
        iframe: (props: { children: string, src: string }) =>
        {
            const { src } = props
            const url = new URL(src)
            const allow = url.hostname === "www.youtube.com"

            return allow ? <iframe {...props} /> : null
        },
        tweet: (props: { id: string }) =>
        {
            const src = `https://platform.twitter.com/embed/Tweet.html?dnt=false&frame=false&hideCard=false&hideThread=false&id=${props.id}&lang=en-gb&theme=light&widgetsVersion=0a8eea3%3A1643743420422&width=400px"`

            return <iframe
                src={src}
                scrolling="no"
                frameBorder={0}
                allowTransparency={true}
                allowFullScreen={true}
                style={{ width: 401, height: 624 }}
            />
        },
        img: (props: { src: string, style: h.JSX.CSSProperties, alt: string }) =>
        {
            delete props.style?.position
            return <img src={props.src} style={props.style} alt={props.alt} />
        }
    },
}
