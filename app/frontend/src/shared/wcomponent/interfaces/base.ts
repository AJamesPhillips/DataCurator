import type { Color } from "../../interfaces"



export interface Base
{
    id: string
    created_at: Date
    custom_created_at?: Date
    label_ids?: string[]
    label_color?: Color
    summary_image?: string
    modified_at?: Date
    modified_by_username?: string
    deleted_at?: Date
}
