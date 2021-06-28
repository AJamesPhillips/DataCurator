


interface CreationContext
{
    custom_created_at?: Date
    label_ids: string[]
}



export interface CreationContextState
{
    use_creation_context: boolean
    creation_context: CreationContext
}
