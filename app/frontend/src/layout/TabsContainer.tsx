import { h } from "preact"
import { ALLOWED_ROUTES } from "../state/State"
import { Tab } from "./Tab"


interface TabsContainerProps
{
    content_changed: () => void
}


export function TabsContainer (props: TabsContainerProps)
{
    setTimeout(() => props.content_changed(), 0) // remove hack

    return <div>
        {ALLOWED_ROUTES.map(route => <Tab id={route} />)}
    </div>
}
