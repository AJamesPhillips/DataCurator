import { h } from "preact"
import { connect, ConnectedProps } from "react-redux"
import { Modal } from "../modal/Modal"
import { ACTIONS } from "../state/actions"
import type { RootState } from "../state/State"



const map_state = (state: RootState) =>
{
    return { show: state.display_options.show_help_menu }
}


const map_dispatch = {
    set_show_help_menu: ACTIONS.display.set_show_help_menu,
}


const connector = connect(map_state, map_dispatch)
type Props = ConnectedProps<typeof connector>



function _HelpMenu (props: Props)
{
    if (!props.show) return null

    return <Modal
        size="large"
        title="Help Menu"
        on_close={() => props.set_show_help_menu({ show: false })}
        child={<div>
            Commands to help you use DataCurator <br />

            When on canvas and not in a form element <br/>
            {commands.map(args => <Command {...args} />)}

            <hr />
            Tips on Linking<br/><br/>

            Type "@@" in any text field to access a menu to link to any other component.  This will insert the id of that component, e.g. @@wc123. <br/>
            Follow "@@some-id" with .url, .title and .description to get the attributes of that component e.g. "@@wc123.title"<br/>
            Markdown is available so you can use things like <b>**some text**</b> to make it bold once it is rendered during presentation mode.  Other Markdown syntax like "1. some text" will give you numbered lists.  See the full <a href="https://www.markdownguide.org/basic-syntax/">Markdown guide here</a><br/>

            <hr />
            General tips<br/><br/>

            If you yourself writing states with should, e.g. "People should listen more and be less reductionist" then you might consider seperating this out into it's 4 seperate parts and phrasing as the positive or desired state.  Specifically:
            <ol>
                <li>the attribute, e.g.: "People listen more and are less reductionist"</li>
                <li>the current value, e.g.: "False"</li>
                <li>the other possibilities, e.g.: whilst adding a value and if it's not boolean i.e. not True/False and is instead a type of number or other, then add the other different possible values.</li>
                <li>the judgement or objective about the desired value, e.g.: create a judgement or objective node, target your state node, and choose the desired value via the comparator</li>
            </ol>
        </div>}
    />
}
export const HelpMenu = connector(_HelpMenu)



const commands: CommandArgs[] = [
    { commands: ["Ctrl", "e"], outcome: "Toggle between presenation and editing modes" },
    { commands: ["Ctrl", "d"], outcome: `Toggle "focused" mode on and off` },
    { commands: ["Shift"], outcome: "shows all nodes" },
    { commands: ["Shift", "click", "drag"], outcome: "select multiple nodes" },
    { commands: ["Ctrl", "click", "drag"], outcome: "deselect multiple nodes" },
    { commands: ["Ctrl", "a"], outcome: "select all nodes on knowledge view" },
]


interface CommandArgs
{
    commands: string[]
    outcome: string
}

function Command (props: CommandArgs)
{
    return <p>
        {props.commands.map(command => <span><pre>{command}</pre> + </span>)} -&gt; {props.outcome}
    </p>
}
