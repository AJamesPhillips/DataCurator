import { FunctionalComponent, h } from "preact"
import { connect, ConnectedProps } from "react-redux"

import { AutocompleteText } from "../../form/AutocompleteText"
import { EditableTextSingleLine } from "../../form/EditableTextSingleLine"
import {
    judgement_operators,
    WComponentJudgement,
} from "../../shared/models/interfaces/judgement"
import type { WComponent } from "../../shared/models/interfaces/SpecialisedObjects"
import { get_wcomponent_from_state } from "../../state/specialised_objects/accessors"
import type { RootState } from "../../state/State"
import { calculate_judgement_value } from "../judgements/calculate_judgement_value"
import { JudgementBadge } from "../judgements/JudgementBadge"
import { WComponentFromTo } from "../WComponentFromTo"



interface OwnProps
{
    wcomponent: WComponentJudgement
    upsert_wcomponent: (partial_wcomponent: Partial<WComponent>) => void
}


const map_state = (state: RootState, { wcomponent }: OwnProps) =>
{

    const target_wcomponent: WComponent | undefined = get_wcomponent_from_state(state, wcomponent.judgement_target_wcomponent_id)

    return {
        target_wcomponent,
    }
}


const connector = connect(map_state)
type Props = ConnectedProps<typeof connector> & OwnProps



function _JudgementFields (props: Props)
{
    const { wcomponent, upsert_wcomponent, target_wcomponent } = props

    const { judgement_manual } = wcomponent
    const selected_option_id_for_manual = judgement_manual === undefined ? undefined : judgement_manual.toString()


    return <p>
        <WComponentFromTo
            connection_terminal_type="meta-effected"
            connection_terminal_type_str="Target"
            parent_wcomponent_id={wcomponent.id}
            wcomponent={target_wcomponent}
            on_update={judgement_target_wcomponent_id => upsert_wcomponent({ judgement_target_wcomponent_id })}
            />

        <p>
            <div style={{ display: "inline-flex" }}>
                Comparator: &nbsp; <AutocompleteText
                    extra_styles={{ width: 30 }}
                    placeholder={"Operator..."}
                    selected_option_id={wcomponent.judgement_operator}
                    get_options={() => judgement_operator_options}
                    on_change={option_id => upsert_wcomponent({ judgement_operator: option_id })}
                    />
                &nbsp; <EditableTextSingleLine
                    placeholder="Value..."
                    value={wcomponent.judgement_comparator_value || ""}
                    on_change={new_value =>
                        {
                        const judgement_comparator_value = new_value.trim()

                        if (judgement_comparator_value === wcomponent.judgement_comparator_value) return
                        upsert_wcomponent({ judgement_comparator_value })
                    }}
                />
            </div>
        </p>

        <p>
            <div style={{ display: "inline-flex" }}>
                Manual: &nbsp; <AutocompleteText
                    placeholder={"Manual override..."}
                    allow_none={true}
                    selected_option_id={selected_option_id_for_manual}
                    get_options={() => manual_options}
                    on_change={option_id => {
                        const judgement_manual = option_id === undefined ? undefined : (option_id === "true" ? true : false)
                        upsert_wcomponent({ judgement_manual })
                    }}
                    />
            </div>
        </p>

        <p>
            <div style={{ display: "inline-flex" }}>
                Current value: &nbsp; <JudgementBadge judgement={calculate_judgement_value({ wcomponent, target_wcomponent })} />
            </div>
        </p>
    </p>
}

export const JudgementFields = connector(_JudgementFields) as FunctionalComponent<OwnProps>


const judgement_operator_options = judgement_operators.map(op => ({ id: op, title: op }))
const manual_options = [{ id: "true", title: "Good" }, { id: "false", title: "Bad" }]
