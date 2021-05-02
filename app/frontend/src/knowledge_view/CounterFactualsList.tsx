import { h } from "preact"

import type { Base } from "../shared/models/interfaces/base"



interface OwnProps
{
    counter_factuals: CounterFactual[]
}

export function CounterFactualsList (props: OwnProps)
{
    return <div>CounterFactualsList</div>
}



interface CounterFactual extends Base
{

}
