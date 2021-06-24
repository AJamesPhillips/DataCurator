import { h } from "preact"

import { Button } from "../sharedf/Button"



interface NowButtonProps
{
    change_datetime_ms: (new_datetime_ms: number) => void
}
export function NowButton (props: NowButtonProps)
{
    return <Button
        value="Now"
        onClick={() => {
            // Add 60 seconds to ensure it is always the next minute
            const datetime_ms = new Date().getTime() + 60000
            props.change_datetime_ms(datetime_ms)
        }}
        is_left={true}
    />
}
