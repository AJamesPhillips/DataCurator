import { PlainShortcutKeys } from "../help_menu/ShortcutCommand"
import { shortcuts_map } from "../help_menu/shortcuts"
import { Button } from "../sharedf/Button"
import {
    conditionally_decrease_selected_components,
    conditionally_expand_selected_components,
    conditionally_select_all_components,
    conditionally_select_forward_causal_components,
    conditionally_select_interconnections,
    conditionally_select_source_causal_components,
} from "../state/specialised_objects/meta_wcomponents/selecting/helpers"
import { get_store } from "../state/store"



export function SelectionControlSidePanel ()
{
    const store = get_store()

    return <div className="side_panel">


        <p className="section">
            <Button
                value="Expand towards causes (backwards)"
                fullWidth={true}
                onClick={() => conditionally_select_source_causal_components(store)}
            />

            <PlainShortcutKeys {...shortcuts_map.expand_select_backwards} />
        </p>


        <p className="section">
            <Button
                value="Expand towards effects (forwards)"
                fullWidth={true}
                onClick={() => conditionally_select_forward_causal_components(store)}
            />

            <PlainShortcutKeys {...shortcuts_map.expand_select_forwards} />
        </p>


        <p className="section">
            <Button
                value="Select all components"
                fullWidth={true}
                onClick={() => conditionally_select_all_components(store)}
            />

            <PlainShortcutKeys {...shortcuts_map.select_all} />
        </p>


        <p className="section">
            <Button
                value="Expand selection (in all directions)"
                fullWidth={true}
                onClick={() => conditionally_expand_selected_components(store)}
            />

            <PlainShortcutKeys {...shortcuts_map.expand_select} />
        </p>


        <p className="section">
            <Button
                value="Contract selection (in all directions)"
                fullWidth={true}
                onClick={() => conditionally_decrease_selected_components(store)}
            />

            <PlainShortcutKeys {...shortcuts_map.decrease_select} />
        </p>


        <p className="section">
            <Button
                value="Select components inbetween"
                fullWidth={true}
                onClick={() => conditionally_select_interconnections(store)}
            />

            <PlainShortcutKeys {...shortcuts_map.select_interconnections} />
            <div className="description">
                Only selects the immediate components inbetween.  e.g. if A ---B--&gt; C ---D--&gt; E, then selecting nodes A and C followed by this command will also select connection B.  But if only node A and node E are selected, then this command will not do anything.
            </div>
        </p>


        {/* <p className="section">
            <FindAllCausalPaths />
        </p> */}
    </div>
}
