import { sentence_case } from "../shared/utils/sentence_case"
import type { ROUTE_TYPES } from "../state/routing/interfaces"



export  function route_to_text (route: ROUTE_TYPES)
{
    if (route === "wcomponents") return "Components"
    else if (route === "display") return "Display Options"
    else if (route === "select") return "Selection"
    // todo implement camel_case
    else return sentence_case(route.replaceAll("_", " "))
}
