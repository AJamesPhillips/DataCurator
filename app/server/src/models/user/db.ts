import { DataTypes, Model } from "sequelize"

import { UserDbFields } from "../../shared/models/user"
import { sequelize } from "../../utils/sequelize_db"
import {
    TABLE_NAMES,
    BASE_FIELDS,
    DEFINE_OPTIONS,
} from "../../base/db"

// Export
export { UserDbFields } from "../../shared/models/user"


type UserFieldsType = {
    [P in keyof UserDbFields]: any
}


const USER_FIELDS: UserFieldsType = {
    ...BASE_FIELDS,
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}


export type UserDbInstance = Model<UserDbFields>


export type UserDbPartialFields = Partial<UserDbFields>


export const UserDb = sequelize.define<UserDbInstance, UserDbPartialFields>(
    TABLE_NAMES.USER, USER_FIELDS, DEFINE_OPTIONS<UserDbInstance>())
