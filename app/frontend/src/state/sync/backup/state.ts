


export type BACKUP_STATUS = "SAVING" | "SAVED" | "FAILED"

export interface BackupState
{
    status: BACKUP_STATUS | undefined
}
