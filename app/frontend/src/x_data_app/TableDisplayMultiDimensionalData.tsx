import { h } from "preact"

import "./TableDisplayMultiDimensionalData.scss"



interface OwnProps
{
    data: string[][]
}


export function TableDisplayMultiDimensionalData (props: OwnProps)
{

    return <table class="multi_dimensional_data_table">
        <thead>

        </thead>
        <tbody>
            {props.data.map(row => <tr>
                {row.map(cell => <td>{cell}</td>)}
            </tr>)}
        </tbody>
    </table>
}
