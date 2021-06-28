import { h } from "preact"
import { prepare_new_VAP_set } from "../knowledge/multiple_values/utils"
import { ValueAndPredictionSetSummary } from "../knowledge/multiple_values/ValueAndPredictionSetSummary"
import { VAPsType } from "../shared/wcomponent/interfaces/generic_value"

import "./SandBox.css"



export function SandBox ()
{
    const VAP_set_simple = prepare_new_VAP_set(VAPsType.number, [], {})
    VAP_set_simple.entries[0]!.value = "possibility 1"
    VAP_set_simple.entries[0]!.probability = 1

    const VAP_set_second = prepare_new_VAP_set(VAPsType.number, [], {})
    VAP_set_second.shared_entry_values = { conviction: 0.90 }
    VAP_set_second.entries[0]!.value = "possibility 1"
    VAP_set_second.entries[0]!.probability = 0.2
    VAP_set_second.entries.push({
        id: "123",
        value: "possibility 2",
        description: "",
        explanation: "",
        probability: 0.8,
        conviction: 0, // ignored
    })

    const VAP_set1 = prepare_new_VAP_set(VAPsType.action, [], {})
    VAP_set1.entries[2]!.probability = 1

    const VAP_set2 = prepare_new_VAP_set(VAPsType.action, [], {})
    VAP_set2.entries[2]!.probability = 0.5
    VAP_set2.entries[3]!.probability = 0.5

    return <div>
        Should display yellow area with height of 50px and green with 0 height and the ? hidden:
        <ValueAndPredictionSetSummary VAP_set={VAP_set_simple} />

        <br />
        <br />
        <br />
        <br />
        <br />

        Should display first yellow area with height of 9px, green with 36px height and the ? with 5px:
        <ValueAndPredictionSetSummary VAP_set={VAP_set_second} />

        <br />
        <br />
        <br />
        <br />
        <br />
        Action 1:
        <ValueAndPredictionSetSummary VAP_set={VAP_set1} />

        <br />
        <br />
        <br />
        <br />
        <br />
        Action 2:
        <ValueAndPredictionSetSummary VAP_set={VAP_set2} />
    </div>
}
