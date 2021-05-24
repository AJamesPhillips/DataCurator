


export interface HasVersion
{
    version: number
}



export interface Base // extends HasVersion
{
    id: string
    created_at: Date
    custom_created_at?: Date
}
