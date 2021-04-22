import type { WComponentBase } from "./SpecialisedObjects"
import type { ExistencePredictions, ValidityPredictions } from "./uncertainty"



export type WComponentNodeType = "event" | "state" | "statev2" | "process" | "actor"


export interface WComponentNodeBase extends WComponentBase, Partial<ValidityPredictions>, Partial<ExistencePredictions>
{
    type: WComponentNodeType
    // encompassed_by: string
}

