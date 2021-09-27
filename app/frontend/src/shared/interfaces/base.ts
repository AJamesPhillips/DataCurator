import type { Color } from "./color"



export interface Base
{
    id: string
    created_at: Date
    custom_created_at?: Date
    base_id?: number
    modified_at?: Date
    modified_by_username?: string
    deleted_at?: Date

    label_ids?: string[]
    label_color?: Color
    summary_image?: string

    // meta sync fields
    needs_save?: boolean
    saving?: boolean
}


// interface Syncable<U>
// {
//     syncing_changes?: U  // whilst this is present no other form should edit this
//     last_sync_failed?: boolean
// }



// function sync_syncable <U> (item: Syncable<U>)
// {
//     if (item.syncing_changes) return false // syncing already in progress or it failed and not yet recovered
//     delete item.last_sync_failed

//     // async call to server with item.syncing_changes
//     if (success_item)
//     {
//         delete success_item.syncing_changes // reset item to allow more changes
//         Store.update(success_item)
//     }
//     else
//     {
//         Store.update({ ...item, last_sync_failed: true })
//     }
// }


// interface Thing extends Base {
//     things: number
// }



// const d1 = new Date()

// const a: Thing = {
//     id: "",
//     created_at: new Date(),
//     modified_at: d1,
//     things: 3,
// }

// // There's a form.  The user edits created_at
// const a1: Thing = {
//     ...a,
//     created_at: new Date("2020")
// }

// // Then they edits things
// const a2: Thing = {
//     ...a,

// }
