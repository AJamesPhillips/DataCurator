import { h } from "preact"

import { ALLOWED_ROUTES } from "../state/routing/interfaces"
import { Tab } from "./Tab"



interface TabsContainerProps
{
    content_changed: () => void
}


export function TabsContainer (props: TabsContainerProps)
{
    setTimeout(() => props.content_changed(), 0) // remove hack

    let routes = ALLOWED_ROUTES
    if (!localStorage.getItem("show_all_tabs"))
    {
        routes = routes.filter(r => r === "objects" || r === "views" || r === "wcomponents")
    }

    return <div>
        {routes.map(route => <Tab id={route} />)}
    </div>
}
