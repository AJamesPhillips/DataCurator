import type { Color } from "../../interfaces"



export interface HasVersion
{
    version: number
}



export interface Base // extends HasVersion
{
    id: string
    created_at: Date
    custom_created_at?: Date
    label_ids?: string[]
    label_color?: Color
}
