import { DataTypes, UUIDV4, Model, ModelOptions } from "sequelize"
import { BaseDbFields } from "../shared/models/base"

export type BaseFields = {
    [P in keyof BaseDbFields]: any
}

export const BASE_FIELDS = {
    uuid: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
    },
    created_at: {
        type: DataTypes.DATE(6),
        allowNull: false,
    },
    modified_at: {
        type: DataTypes.DATE(6),
        allowNull: true,
    },
    deleted_at: {
        type: DataTypes.DATE(6),
        allowNull: true,
    },
}

// Only used in sequelize.define, not yet usable in the migrations
export function DEFINE_OPTIONS<DbInstance extends Model>(): ModelOptions<DbInstance> {
    return {
        paranoid: true,
        freezeTableName: true,
        timestamps: true,
        underscored: true,
        // We specify these explicitly even though sequelize does a fine job of this
        createdAt: "created_at",
        deletedAt: "deleted_at",
        updatedAt: "modified_at",
    }
}

export const TABLE_NAMES = {
    USER: "user",
}

export const FOREIGN_KEYS = {
}
