import type * as Boom from "boom"


export namespace RequestPayload {
    export interface DemoRequestPayload {
        some_data: string
    }
}

export namespace ResponsePayload {

    export type DemoResponsePayload = {
        some_data: string
    } | Boom.Payload
}
