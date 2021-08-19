


export type BACKUP_STATUS = "SAVING" | "SAVED"

export interface BackupState
{
    status: BACKUP_STATUS | undefined
}
