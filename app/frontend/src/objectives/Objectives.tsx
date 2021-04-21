import { h } from "preact"

import { MainArea } from "../layout/MainArea"
import { performance_logger } from "../utils/performance"
import { ObjectivesGraph } from "./ObjectivesGraph"


export function Objectives ()
{
    performance_logger("Objectives...")

    return <MainArea
        main_content={<ObjectivesGraph />}
        main_content_controls={[]}
    />
}
